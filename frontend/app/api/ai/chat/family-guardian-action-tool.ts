import { ITool } from "./tool-registry";
import { generateAIResponseWithUsage } from "@/lib/ai-provider";
import Child from "@/models/Child";
import Family from "@/models/Family";

export interface IFamilyGuardianActionToolParams {
  query: string;
  userId: string;
}

export interface IFamilyGuardianActionToolResult {
  requiresConfirmation: boolean;
  confirmationPrompt: string;
  actionPayload: {
    action: "family_guardian_action";
    payload: {
      childName: string;
      appName: string;
      policyType: "block" | "allow" | "limit";
      durationMinutes?: number;
    };
  };
}

export class FamilyGuardianActionTool implements ITool {
  public readonly id = "family_guardian_action";
  public readonly name = "Family Guardian Action";
  public readonly description = "Manages Family Guardian settings, such as blocking/allowing apps or websites for a child. Use this for requests like 'Block YouTube for an hour for Rahul'.";
  public readonly requiredFeatures = ["FAMILY_GUARDIAN_ACCESS"];
  public readonly category = "Family Guardian";

  async execute(params: IFamilyGuardianActionToolParams): Promise<IFamilyGuardianActionToolResult> {
    const { query, userId } = params;

    // Fetch the user's children to provide context to the AI
    // Securely fetch children belonging to the authenticated user's family
    const family = await Family.findOne({ parentId: userId });
    if (!family) throw new Error("Could not find a family for the current user.");
    const children = await Child.find({ familyId: family._id });
    const childNames = children.map(c => c.name).join(", ");

    const prompt = `
You are a Family Guardian action parser. Analyze the user's request and extract the required parameters to create a policy.

User Request: "${query}"
Available Children: "${childNames}"

Extract the following information and return ONLY a JSON object:
{
  "childName": "The name of the child from the available list.",
  "appName": "The name of the application or website (e.g., 'YouTube', 'Instagram').",
  "policyType": "Must be one of: 'block', 'allow', 'limit'.",
  "durationMinutes": "The duration in minutes, if specified (e.g., for '1 hour', return 60). Null if not specified."
}

Rules:
- If the child name is not in the available list, set childName to null.
- If any parameter cannot be determined, set its value to null.
- For "allow" or "unblock", policyType is "allow".
- For "block" or "restrict", policyType is "block".
- For "limit", policyType is "limit".
`;

    const { response: jsonResponse } = await generateAIResponseWithUsage(prompt);
    let parsedAction;
    try {
      parsedAction = JSON.parse(jsonResponse.replace(/```json\n|```/g, "").trim());
    } catch (e) {
      console.error("Failed to parse AI JSON for Family Guardian action:", e);
      throw new Error("I had trouble understanding the action to take. Could you please rephrase your request?");
    }

    if (!parsedAction.childName || !parsedAction.appName || !parsedAction.policyType) {
      throw new Error("I can help with that, but I need to know which child and which application you're referring to.");
    }

    const confirmationPrompt = `I am ready to apply the following policy: **${parsedAction.policyType} ${parsedAction.appName} for ${parsedAction.childName}**. Please confirm.`;

    return {
      requiresConfirmation: true,
      confirmationPrompt,
      actionPayload: {
        action: "family_guardian_action",
        payload: parsedAction,
      },
    };
  }
}