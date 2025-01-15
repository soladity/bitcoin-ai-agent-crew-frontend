import { Tour } from "nextstepjs";

export const tourSteps: Tour[] = [
    {
        tour: "mainTour", //main function to execute the below steps..can create more functions like this
        steps: [
            {
                icon: "",
                title: "Welcome to AIBTC.DEV. 👋",
                content: "I'll guide you through the basics to get started. Let's dive in!",
                selector: "#step1", //now you can assign any component this id and it will guide you to this step...
                side: "bottom", //position where you want to show the guide card 
                showControls: true, //default 
                showSkip: true, //default
            },
            {
                icon: "",
                title: "Chats 💬",
                content: "All your past conversations live here.",
                selector: "#step2",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "",
                title: "Start a new chat 💬",
                content: "You can start a new chat from here.",
                selector: "#step3",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "",
                title: "Agents 🤖",
                content: "View, manage and assign tasks to your AI agents.",
                selector: "#agents",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "",
                title: "DAOs 🏛️",
                content: "Explore and participate in decentralized organizations.",
                selector: "#daos",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "",
                title: "Profile 🥷🏻",
                content: "Manage your account settings and personal details.",
                selector: "#profile",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            // {
            //     icon: "",
            //     title: "Assistant Wallet 🔒",
            //     content: "This is your connected wallet.",
            //     selector: "#step5",
            //     side: "right",
            //     showControls: true,
            //     showSkip: true,
            // },
            // {
            //     icon: "",
            //     title: "Agent Wallets 🤖",
            //     content: "These are your agent wallets.",
            //     selector: "#step6",
            //     side: "left",
            //     showControls: true,
            //     showSkip: true,
            // },
        ],
    },
];