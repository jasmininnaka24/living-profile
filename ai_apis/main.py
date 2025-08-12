# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from openai import OpenAI
import os, json

load_dotenv(override=True)
openai_api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()
MODEL = "gpt-4o-mini"

app = FastAPI(title="Character Profile API", version="1.0.0")


# ----------------------------
# Tool function (your Python)
# ----------------------------
def get_character_profile_information(
    background: str,
    notable_works: str,
    occupation: str,
    first_appearance: str,
    era: str,
) -> Dict[str, Any]:
    return {
        "background": background,
        "notable_works": notable_works,
        "occupation": occupation,
        "first_appearance": first_appearance,
        "era": era,
    }


# ---------------------------------------
# Tool schema (for OpenAI function-calls)
# ---------------------------------------
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
                "example": "Theory of Special Relativity, Theory of General Relativity, Photoelectric Effect, Mass–Energy Equivalence (E=mc²)",
            },
            "occupation": {
                "type": "string",
                "description": "The primary profession, role, or title of the character.",
                "example": "Theoretical Physicist",
            },
            "first_appearance": {
                "type": "string",
                "description": "The date, year, or title of the work/event where the character first appeared or was introduced. This can be a publication, film, historical record, or other medium.",
                "example": "Action Comics #1 (1938)",
            },
            "era": {
                "type": "string",
                "description": "The historical or fictional time period in which the character lived or was most active, including the range of years. Strictly follow the format in the example.",
                "example": "19th Century (1879–1955)",
            },
        },
        "required": ["background", "notable_works", "occupation", "first_appearance", "era"],
        "additionalProperties": False,
    },
}

TOOLS = [{"type": "function", "function": get_character_profile_information_json}]

# ----------------------------
# Request / Response models
# ----------------------------
class CharacterRequest(BaseModel):
    character_name: str = Field(..., example="William Shakespeare")
    force_tool: bool = Field(False, description="Force the model to call the tool")


class ToolData(BaseModel):
    background: str
    notable_works: str
    occupation: str
    first_appearance: str
    era: str


class CharacterResponse(BaseModel):
    tool_called: bool
    tool_name: Optional[str] = None
    tool_data: Optional[ToolData] = None
    raw_tool_message: Optional[Dict[str, Any]] = None
    assistant_text: Optional[str] = None


# ----------------------------
# Helpers
# ----------------------------
def handle_tool_calls(tool_calls) -> List[Dict[str, Any]]:
    """Run each tool and return a list of role='tool' messages to send back to the model."""
    results: List[Dict[str, Any]] = []

    # If you have multiple tools, map names to functions here.
    tool_registry = {
        "get_character_profile_information": get_character_profile_information,
    }

    for tc in tool_calls:
        tool_name = tc.function.name
        args_json = tc.function.arguments or "{}"
        try:
            args = json.loads(args_json)
        except json.JSONDecodeError:
            args = {}

        tool_fn = tool_registry.get(tool_name)
        if not callable(tool_fn):
            results.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps({"error": f"Tool '{tool_name}' not found"}),
                }
            )
            continue

        result_data = tool_fn(**args)  # returns dict
        results.append(
            {
                "role": "tool",
                "tool_call_id": tc.id,
                "content": json.dumps(result_data),
            }
        )

    return results


# ----------------------------
# Route
# ----------------------------
@app.post("/character", response_model=ToolData)
def get_character_profile(payload: CharacterRequest):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")

    messages = [
        {
            "role": "system",
            "content": "You are a narrator who knows a lot about people and provide character information factually.",
        },
        {
            "role": "user",
            "content": f"Give me factual background information of {payload.character_name}. If you don't know this character, return N/A for each field.",
        },
    ]

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="required"  # always call the tool
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI error: {e}")

    msg = response.choices[0].message

    # Fallback if no tool call
    if not msg.tool_calls:
        return ToolData(
            background="N/A",
            notable_works="N/A",
            occupation="N/A",
            first_appearance="N/A",
            era="N/A"
        )

    tool_msgs = handle_tool_calls(msg.tool_calls)
    if not tool_msgs:
        raise HTTPException(status_code=500, detail="Tool returned no messages")

    # FIX: just load the JSON content from the first tool message
    tool_data_dict = json.loads(tool_msgs[0]["content"])

    return ToolData(**tool_data_dict)

