import { Tour } from "nextstepjs";

export const tourSteps: Tour[] = [
    {
        tour: "mainTour",
        steps: [
            {
                icon: "👋",
                title: "Welcome to Aibtcdev",
                content: "I'm your guide to help you get started..",
                selector: "#step1",
                side: "bottom",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "👋",
                title: "This is second step",
                content: "I'm your guide to help you get started. second step.",
                selector: "#step2",
                side: "right",
                showControls: true,
                showSkip: true,
            },
            {
                icon: "👋",
                title: "This is second step",
                content: "I'm your guide to help you get started. second step.",
                selector: "#step3",
                side: "right",
                showControls: true,
                showSkip: true,
            },
        ],
    },
];