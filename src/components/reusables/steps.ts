import { Tour } from "nextstepjs";

export const tourSteps: Tour[] = [
    {
        tour: "mainTour", //main function to execute the below steps..can create more functions like this
        steps: [
            {
                icon: "👋",
                title: "Welcome to AIBTC.DEV.",
                content: "I'm your guide to help you get started..",
                selector: "#step1", //now you can assign any component this id and it will guide you to this step...
                side: "bottom", //position where you want to show the guide card 
                showControls: true, //default 
                showSkip: true, //default
            },
            {
                icon: "💬",
                title: "Threads",
                content: "It consist your threads which is basically a chat history",
                selector: "#step2",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "💬",
                title: "Add thread",
                content: "You can add new thread by clicking this button and start a chat.",
                selector: "#step3",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "🧭",
                title: "Navigations",
                content: "You can create agents, DAOs and go to your profile from here..",
                selector: "#step4",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "👜",
                title: "Wallet",
                content: "These is your personal wallet.",
                selector: "#step5",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "🤖",
                title: "Agent Wallets",
                content: "These are your agent wallets. You can fund them by copying their address and sending stx to them..",
                selector: "#step6",
                side: "left",
                showControls: true,
                showSkip: true,
            },
        ],
    },
];