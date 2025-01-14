export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters?: string;
}


let toolsCache: Tool[] | null = null;

export async function fetchTools(): Promise<Tool[]> {
  if (toolsCache) return toolsCache;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tools/available`
    );
    const data = await response.json() as Tool[];

    toolsCache = data;
    return data;
  } catch (error) {
    console.error('Failed to fetch tools:', error);
    throw new Error('Failed to fetch tools from API');
  }
}

export const getToolsByCategory = async (category: string): Promise<Tool[]> => {
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
