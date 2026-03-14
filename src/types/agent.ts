export type Agent = {
  id: string;
  name: string;
  description: string;
  author: string;
  url: string;
  npm_package: string;
  install_cmd: string;
  requires_board: boolean;
  supported_boards?: string[];
  has_roles?: boolean;
  optional_roles?: string[];
  multi_runtime?: string[];
  init_slash?: string;
  new_project_slash?: string;
  map_codebase_slash?: string;
  supports_existing_project: boolean;
  supports_greenfield: boolean;
};

export type AgentRegistry = {
  agents: Agent[];
};
