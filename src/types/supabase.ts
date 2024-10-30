// Interface for a crew 
export interface Crew {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

// Interface for props of the CrewManagement component
export interface CrewManagementProps {
    crews: Crew[]; // Array of crew members
    onCrewSelect: (crew: Crew) => void; // Callback for when a crew is selected
    onCrewUpdate: () => Promise<void> | void; // Callback for when a crew is updated
}

// Interface for props of the CrewForm component
export interface CrewFormProps {
    onCrewCreated: () => void; // Callback for when a new crew is created
    onClose: () => void; // Callback for when the form is closed
}

// Interface representing an agent
export interface Agent {
    id: number;
    name: string;
    role: string;
    goal: string;
    backstory: string;
    agent_tools: string[]; // Array of agent tools
}

// Interface for props of the AgentForm component
export interface AgentFormProps {
    agent?: Agent; // Optional existing agent to edit
    onSubmit: (agent: Omit<Agent, "id">) => Promise<void>; // Callback for submitting the agent form
    loading: boolean; // Indicates if the form is currently loading
}

// Interface for props of the AgentManagement component
export interface AgentManagementProps {
    crewId: number; // ID of the current crew
    onAgentAdded: () => void; // Callback for when a new agent is added
}

// Interface representing a task
export interface Task {
    id: number;
    description: string;
    expected_output: string;
    agent_id: number; // ID of the assigned agent
    profile_id: string; // ID of the associated profile
}

// Interface for props of the TaskForm component
export interface TaskFormProps {
    crewId: number; // ID of the current crew
    agents: Agent[]; // Array of agents
    task?: Task; // Optional existing task to edit
    onTaskSubmitted: () => void; // Callback for when a task is submitted
    onClose: () => void; // Callback for when the form is closed
}

// Interface for props of the TaskManagement component
export interface TaskManagementProps {
    crewId: number; // ID of the current crew
    onTaskAdded: () => void; // Callback for when a new task is added
    tasks: Task[]; // Array of tasks
    agents: Agent[]; // Array of agents
    currentUser: string | null; // ID of the current user
    onEditTask: (task: Task) => void; // Callback for editing a task
}

// Interface for a cloned agent
export interface CloneAgent {
    name: string;
    role: string;
    goal: string;
    backstory: string;
    agent_tools: string[]; // Array of agent tools
}

// Interface for a cloned task
export interface CloneTask {
    description: string;
    expected_output: string;
}