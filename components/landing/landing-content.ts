export const landingFeatures = [
    {
        id: `grids`,
        icon: `th-large`,
        title: `A Place For Every Project`,
        description: `Group your work into grids, then give each project its own boards, lists, and items`,
    },
    {
        id: `movement`,
        icon: `arrows-alt`,
        title: `A Workflow That Moves With You`,
        description: `Drag boards into order, rearrange lists, and move items as your priorities change`,
    },
    {
        id: `subtasks`,
        icon: `tasks`,
        title: `Big Ideas, Small Steps`,
        description: `Break an item into manageable subtasks and check off each step as you go`,
    },
    {
        id: `progress`,
        icon: `chart-line`,
        title: `Progress You Can See`,
        description: `See completion indicators for your items and tasks, so you know what still needs attention`,
    },
    {
        id: `focus`,
        icon: `bullseye`,
        title: `Less Noise, More Focus`,
        description: `Focus on one board, collapse the others, and hide completed items to clear your view`,
    },
    {
        id: `details`,
        icon: `paperclip`,
        title: `Keep The Context Close`,
        description: `Bring descriptions, related links, cover images, and media attachments into your work`,
    },
];

export const landingWorkspaces = [
    {
        id: `work`,
        label: `Work`,
        icon: `briefcase`,
        title: `Website Launch`,
        lists: [
            { title: `To Do`, items: [`Collect inspiration`, `Plan the next release`] },
            { title: `In Progress`, items: [`Build the landing page`, `Refine the details`] },
            { title: `Complete`, items: [`Choose a direction`, `Organize the project`] },
        ],
    },
    {
        id: `personal`,
        label: `Personal`,
        icon: `coffee`,
        title: `A Little Everyday Progress`,
        lists: [
            { title: `To Do`, items: [`Plan the weekend`, `Sort the reading list`] },
            { title: `In Progress`, items: [`Learn something new`, `Make time for a hobby`] },
            { title: `Complete`, items: [`Set this week's goals`, `Clear the desk`] },
        ],
    },
    {
        id: `creative`,
        label: `Creative`,
        icon: `lightbulb`,
        title: `The Next Big Idea`,
        lists: [
            { title: `To Do`, items: [`Gather references`, `Explore a new concept`] },
            { title: `In Progress`, items: [`Sketch the first draft`, `Experiment with color`] },
            { title: `Complete`, items: [`Capture the idea`, `Create a mood board`] },
        ],
    },
];
