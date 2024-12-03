export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  parameters?: string;
}

export type ToolCategory = "alex" | "bitflow" | "lunarcrush" | "web_search" | "velar" | "stacks" | "contract" | "wallet";

export const TOOL_CATEGORIES: Record<ToolCategory, string> = {
  alex: "ALEX DEX Tools",
  bitflow: "Bitflow Trading Tools",
  lunarcrush: "LunarCrush Analytics",
  web_search: "Web Search Tools",
  velar: "Velar Tools",
  stacks: "Stacks Tools",
  contract: "Contract Tools",
  wallet: "Wallet Tools"
};

let toolsCache: Tool[] | null = null;

export async function fetchTools(): Promise<Tool[]> {
  if (toolsCache) return toolsCache;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/crew/tools`
    );
    const data = await response.json() as Record<string, string>;

    const tools: Tool[] = Object.entries(data).map(([id, description]) => {
      const category = id.split('_')[0] as ToolCategory;
      const nameMatch = description.match(/^([^:]+):/);
      const name = nameMatch ? nameMatch[1].trim() : id;

      // Extract parameters if they exist
      const paramsMatch = description.match(/\((.*?)\)/);
      const parameters = paramsMatch ? paramsMatch[1] : undefined;

      // Clean up description by removing the name prefix and parameters
      const cleanDescription = description
        .replace(/^[^:]+:\s*/, '')
        .replace(/\(.*?\)\s*-\s*/, '');

      return {
        id,
        name,
        description: cleanDescription,
        category,
        parameters
      };
    });

    toolsCache = tools;
    return tools;
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    throw new Error('Failed to fetch tools from API');
  }
}

export const getToolsByCategory = async (category: ToolCategory): Promise<Tool[]> => {
  const tools = await fetchTools();
  return tools.filter((tool) => tool.category === category);
};

export const getToolsByIds = async (ids: string[]): Promise<Tool[]> => {
  const tools = await fetchTools();
  return tools.filter((tool) => ids.includes(tool.id));
};

export const getTool = async (id: string): Promise<Tool> => {
  const tools = await fetchTools();
  const tool = tools.find((tool) => tool.id === id);
  if (!tool) {
    throw new Error(`Tool with id "${id}" not found`);
  }
  return tool;
};

// Helper function to get all available tool IDs
export const getAvailableTools = async (): Promise<string[]> => {
  const tools = await fetchTools();
  return tools.map(tool => tool.id);
};
