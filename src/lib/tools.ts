export const alex_tools = [
  "alex_get_price_history",
  "alex_get_swap_info",
  "alex_get_token_pool_volume",
];

export const bitflow_tools = [
  "bitflow_get_available_tokens",
  "bitflow_execute_trade",
];

export const lunarcrush_tools = ["lunarcrush_get_token_data"];

export const web_search_tools = ["web_search_experimental"];

export const AVAILABLE_TOOLS = [
  ...alex_tools,
  ...bitflow_tools,
  ...lunarcrush_tools,
  ...web_search_tools,
];
