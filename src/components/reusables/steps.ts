import { Tour } from "nextstepjs";

export const tourSteps: Tour[] = [
    {
        tour: "mainTour",
        steps: [
            {
                icon: "👋",
                title: "Welcome to AIBTC.DEV.",
                content: "I'm your guide to help you get started..",
                selector: "#step1",
                side: "bottom",
                showControls: true,
                showSkip: true,
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