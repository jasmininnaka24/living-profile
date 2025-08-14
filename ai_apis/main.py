from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from openai import OpenAI
from typing import Any
import os
import json

load_dotenv(override=True)

if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("Please set OPENAI_API_KEY in your environment or .env file")

client = OpenAI()
MODEL = "gpt-4o-mini"

app = FastAPI(title="Character Profile API", version="1.0.0")

# Allow local dev frontends to call this API
origins = os.getenv("CORS_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_text(value: Any, fallback: str) -> str:
    # Accept list/str/None; normalize to concise string
    if value is None:
        return fallback
    if isinstance(value, list):
        return ", ".join(str(v).strip() for v in value if str(v).strip()) or fallback
    s = str(value).strip()
    return s or fallback

def get_character_profile_information(
    background: Any = None,
    notable_works: Any = None,
    occupation: Any = None,
    first_appearance: Any = None,
    era: Any = None,
) -> Dict[str, Any]:
    return {
        "background": _to_text(background, "N/A"),
        "notable_works": _to_text(notable_works, "N/A"),
        "occupation": _to_text(occupation, "N/A"),
        "first_appearance": _to_text(first_appearance, "N/A"),
        "era": _to_text(era, "Unknown"),
    }

# JSON schema describing the tool for OpenAI
get_character_profile_information_json = {
    "name": "get_character_profile_information",
    "description": "Get the character's information like the background, notable works, occupation, first appearance, and era",
    "parameters": {
        "type": "object",
        "properties": {
            "background": {
                "type": "string",
                "description": "Background or the summary of information about the character; factual; ≤1000 characters.",
                "maxLength": 1000,
            },
            "notable_works": {
                "type": "string",
                "description": "A concise summary of the character’s most notable achievements, contributions, or works.",
            },
            "occupation": {
                "type": "string",
                "description": "The primary profession, role, or title of the character.",
            },
            "first_appearance": {
                "type": "string",
                "description": "The date/year/work where the character first appeared or was introduced.",
            },
            "era": {
                "type": "string",
                "description": "Historical/fictional period (e.g., '19th Century (1879–1955)').",
            },
        },
        "required": ["background", "notable_works", "occupation", "first_appearance", "era"],
        "additionalProperties": False,
    },
}

TOOLS = [{"type": "function", "function": get_character_profile_information_json}]

class CharacterRequest(BaseModel):
    character_name: str = Field(..., example="Albert Einstein")
    force_tool: bool = Field(
        default=True,
        description="If true, the model must call the tool; if false, it can decide.",
    )

class ToolData(BaseModel):
    background: str
    notable_works: str
    occupation: str
    first_appearance: str
    era: str

class ChatHistoryMessage(BaseModel):
    role: str  # "system" | "user" | "assistant" | "tool"
    content: str

class ChatRequest(BaseModel):
    character_name: str
    role: str
    user_message: str
    history: List[ChatHistoryMessage] = Field(default_factory=list)

    # NEW: allow client to pass already-fetched facts to avoid re-fetching
    character_information: Optional[ToolData] = None


class ChatResponse(BaseModel):
    character_information: ToolData
    system_role_used: str 
    assistant_text: str

# ----------------------------------------------------
# Small helpers
# ----------------------------------------------------
def handle_tool_calls(tool_calls) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    registry = {
        "get_character_profile_information": get_character_profile_information,
    }

    for tc in tool_calls:
        tool_name = getattr(tc.function, "name", None)
        raw_args = getattr(tc.function, "arguments", {})  # may be str or dict or None

        # Parse arguments safely
        if isinstance(raw_args, str):
            raw_args = raw_args.strip()
            if not raw_args:
                args = {}
            else:
                try:
                    args = json.loads(raw_args)
                except json.JSONDecodeError:
                    args = {}
        elif isinstance(raw_args, dict):
            args = raw_args
        else:
            args = {}

        tool_fn = registry.get(tool_name)
        if not callable(tool_fn):
            results.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps({"error": f"Tool '{tool_name}' not found"}),
                }
            )
            continue

        # Optional: merge soft defaults before calling (tool also has its own fallbacks)
        defaults = {
            "background": None,
            "notable_works": None,
            "occupation": None,
            "first_appearance": None,
            "era": None,
        }
        safe_args = {**defaults, **(args or {})}

        data = tool_fn(**safe_args)  # returns dict; now safe even with missing fields
        results.append(
            {
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(data),
            }
        )

    return results


def fetch_character_info(character_name: str, force_tool: bool = True) -> ToolData:
    messages = [
        {
            "role": "system",
            "content": "You are a narrator who provides character information factually.",
        },
        {
            "role": "user",
            "content": f"Give me factual background information of {character_name}. If you don't know this character, return N/A for each field.",
        },
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="required" if force_tool else "auto",
            max_tokens=200
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI error: {e}")

    msg = response.choices[0].message

    if not getattr(msg, "tool_calls", None):
        return ToolData(
            background="N/A",
            notable_works="N/A",
            occupation="N/A",
            first_appearance="N/A",
            era="N/A",
        )

    tool_msgs = handle_tool_calls(msg.tool_calls)
    if not tool_msgs:
        raise HTTPException(status_code=500, detail="Tool returned no messages")

    tool_data_dict = json.loads(tool_msgs[0]["content"])
    return ToolData(**tool_data_dict)


@app.post("/character", response_model=ToolData)
def get_character_profile(payload: CharacterRequest):
    return fetch_character_info(payload.character_name, force_tool=payload.force_tool)

@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    # 1) Use client-provided info if present; otherwise fetch
    if payload.character_information:
        info = payload.character_information
    else:
        info = fetch_character_info(payload.character_name, force_tool=True)

    info_json = json.dumps(info.dict(), ensure_ascii=False)

    character_name = payload.character_name.strip()
    role_in = payload.role.strip()
    is_character = role_in.lower() == character_name.lower()

    # 2) Softer prompts: greet & be helpful even if info is limited
    character_system_message = (
        f"You are {character_name}. Stay strictly in character (tone, knowledge, mannerisms). "
        f"Use the provided info as ground truth when relevant. "
        f"Here's initial information: {info_json}. "
        f"If the user greets or asks something generic, respond naturally as {character_name} "
        f"If asked for unknown specifics, and you don't know the answer for it, just kindly say so."
        f"and suggest a related topic you can discuss."
    )

    narrator_system_message = (
        f"You are a factual narrator about {character_name}. "
        f"Be concise and accurate; use the provided info as ground truth. "
        f"Here's initial information: {info_json}. "
        f"If the user greets or asks something generic, give a brief friendly reply and offer a short "
        f"summary about {character_name}. If asked for unknown specifics, and you don't know the answer for it, just kindly say so."
    )

    system_content = character_system_message if is_character else narrator_system_message

    # 3) Build messages: system + history + user
    base_messages: List[Dict[str, str]] = [{"role": "system", "content": system_content}]
    history_dicts = [{"role": h.role, "content": h.content} for h in payload.history]
    messages = base_messages + history_dicts[-20:]
    messages.append({"role": "user", "content": payload.user_message})

    # 4) Ask model
    try:
        response = client.chat.completions.create(model=MODEL, messages=messages, max_tokens=200)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI error (chat): {getattr(e, 'message', str(e))}")

    assistant_text = response.choices[0].message.content or ""

    return ChatResponse(
        character_information=info,
        system_role_used="character" if is_character else "narrator",
        assistant_text=assistant_text,
    )
