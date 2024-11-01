export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
}

export type ToolCategory = "alex" | "bitflow" | "lunarcrush" | "web_search";

export const TOOL_CATEGORIES: Record<ToolCategory, string> = {
  alex: "ALEX DEX Tools",
  bitflow: "Bitflow Trading Tools",
  lunarcrush: "LunarCrush Analytics",
  web_search: "Web Search Tools",
};

export const TOOLS: Tool[] = [
  {
    id: "alex_get_price_history",
    name: "ALEX Price History",
    description: "Fetch historical price data from ALEX DEX",
    category: "alex",
  },
  {
    id: "alex_get_swap_info",
    name: "ALEX Swap Info",
    description: "Get swap pool information and rates",
    category: "alex",
  },
  {
    id: "alex_get_token_pool_volume",
    name: "ALEX Pool Volume",
    description: "Retrieve token pool volume statistics",
    category: "alex",
  },
  {
    id: "bitflow_get_available_tokens",
    name: "Bitflow Available Tokens",
    description: "List all available tokens for trading",
    category: "bitflow",
  },
  {
    id: "bitflow_execute_trade",
    name: "Bitflow Trade Execution",
    description: "Execute trades on Bitflow",
    category: "bitflow",
  },
  {
    id: "lunarcrush_get_token_data",
    name: "LunarCrush Token Data",
    description: "Get social and market data for tokens",
    category: "lunarcrush",
  },
  {
    id: "web_search_experimental",
    name: "Web Search",
    description: "Search the web for relevant information",
    category: "web_search",
  },
];

// Helper functions to get tools
export const getToolsByCategory = (category: ToolCategory): Tool[] =>
  TOOLS.filter((tool) => tool.category === category);

export const getToolsByIds = (ids: string[]): Tool[] =>
  TOOLS.filter((tool) => ids.includes(tool.id));

// Legacy exports for backward compatibility
export const alex_tools = TOOLS.filter((tool) => tool.category === "alex").map(
  (tool) => tool.id
);

export const bitflow_tools = TOOLS.filter(
  (tool) => tool.category === "bitflow"
).map((tool) => tool.id);

export const lunarcrush_tools = TOOLS.filter(
  (tool) => tool.category === "lunarcrush"
).map((tool) => tool.id);

export const web_search_tools = TOOLS.filter(
  (tool) => tool.category === "web_search"
).map((tool) => tool.id);

export const AVAILABLE_TOOLS = TOOLS.map((tool) => tool.id);
