import Link from 'next/link';
import CubeField from './cube-field';
import HeroMonolith from './hero-monolith';
import { useState, type KeyboardEvent } from 'react';
import { landingFeatures, landingWorkspaces } from './landing-content';

const Landing = () => {
    const [workspaceIndex, setWorkspaceIndex] = useState(0);
    const workspace = landingWorkspaces[workspaceIndex];
    const onWorkspaceKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const lastIndex = landingWorkspaces.length - 1;
        const nextIndex = event.key === `Home` ? 0 : event.key === `End` ? lastIndex
            : event.key === `ArrowRight` ? (index + 1) % landingWorkspaces.length
            : event.key === `ArrowLeft` ? (index + lastIndex) % landingWorkspaces.length : null;
        if (nextIndex === null) return;
        event.preventDefault();
        setWorkspaceIndex(nextIndex);
        document.getElementById(`landing-workspace-tab-${landingWorkspaces[nextIndex]?.id}`)?.focus();
    };

    return (
        <main id={`landing-page`} className={`landingPage`}>
            <section id={`landing-hero`} className={`landingHero`} aria-labelledby={`landing-hero-title`}>
                <CubeField />
                <div id={`landing-hero-inner`} className={`landingInner landingHeroInner`}>
                    <div id={`landing-hero-copy`} className={`landingHeroCopy`}>
                        <h1 id={`landing-hero-title`} className={`landingHeroTitle`}>
                            <span id={`landing-title-intro`} className={`landingTitleIntro`}>
                                {`THE GREAT`}
                            </span>
                            <span id={`landing-title-accent`} className={`landingTitleAccent`}>
                                {`FOUNDATION`}
                            </span>
                        </h1>
                        <div id={`landing-hero-actions`} className={`landingActions`}>
                            <Link id={`landing-open-workspace`} className={`landingButton`} href={`/`}>
                                <span id={`landing-open-workspace-label`} className={`landingButtonLabel`}>
                                    {`Get Started`}
                                </span>
                                <i id={`landing-open-workspace-icon`} className={`landingButtonIcon fas fa-arrow-right`} aria-hidden={true} />
                            </Link>
                        </div>
                    </div>
                </div>
                <HeroMonolith />
            </section>

            <section id={`landing-workflow`} className={`landingWorkflow`} aria-label={`Your Workflow`}>
                <div id={`landing-workflow-inner`} className={`landingInner landingWorkflowInner`}>
                    {[
                        { title: `Find Your Structure`, description: `Grids, boards, and lists for the way you think` },
                        { title: `Make Your Next Move`, description: `Items and subtasks to turn ideas into action` },
                        { title: `Watch It Come Together`, description: `Visible progress, one completed step at a time` },
                    ].map((step, index) => (
                        <div key={step.title} id={`landing-workflow-step-${index}`} className={`landingWorkflowStep`}>
                            <span id={`landing-workflow-number-${index}`} className={`landingStepNumber`}>
                                {`0${index + 1}`}
                            </span>
                            <div id={`landing-workflow-copy-${index}`} className={`landingStepCopy`}>
                                <h2 id={`landing-workflow-title-${index}`} className={`landingStepTitle`}>
                                    {step.title}
                                </h2>
                                <p id={`landing-workflow-description-${index}`} className={`landingStepDescription`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id={`landing-workspace`} className={`landingWorkspace`} aria-labelledby={`landing-workspace-title`}>
                <div id={`landing-workspace-inner`} className={`landingInner landingWorkspaceInner`}>
                    <div id={`landing-workspace-copy`} className={`landingWorkspaceCopy`}>
                        <p id={`landing-workspace-eyebrow`} className={`landingEyebrow`}>
                            {`PRODUCTIVF / A WORKSPACE THAT FITS`}
                        </p>
                        <h2 id={`landing-workspace-title`} className={`landingSectionTitle`}>
                            {`Everything in its place.`}
                        </h2>
                        <p id={`landing-workspace-description`} className={`landingDescription`}>
                            {`A project at work. A personal goal. An idea you can't leave alone. Give each one a home, then build a workflow around it.`}
                        </p>
                        <div id={`landing-workspace-tabs`} className={`landingWorkspaceTabs`} role={`tablist`} aria-label={`Example Workspaces`}>
                            {landingWorkspaces.map((example, index) => (
                                <button
                                    role={`tab`}
                                    type={`button`}
                                    key={example.id}
                                    tabIndex={workspaceIndex === index ? 0 : -1}
                                    aria-selected={workspaceIndex === index}
                                    aria-controls={`landing-board-preview`}
                                    id={`landing-workspace-tab-${example.id}`}
                                    onClick={() => setWorkspaceIndex(index)}
                                    onKeyDown={(event) => onWorkspaceKeyDown(event, index)}
                                    className={`landingWorkspaceTab ${workspaceIndex === index ? `landingWorkspaceTabActive` : ``}`}
                                >
                                    <i id={`landing-workspace-icon-${example.id}`} className={`landingTabIcon fas fa-${example.icon}`} aria-hidden={true} />
                                    <span id={`landing-workspace-label-${example.id}`} className={`landingTabLabel`}>
                                        {example.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p id={`landing-preview-note`} className={`landingPreviewNote`}>
                            {`An example of how your boards can look`}
                        </p>
                    </div>
                    <div
                        role={`tabpanel`}
                        tabIndex={0}
                        id={`landing-board-preview`}
                        className={`landingBoardPreview`}
                        aria-labelledby={`landing-workspace-tab-${workspace.id}`}
                    >
                        <div id={`landing-board-heading`} className={`landingBoardHeading`}>
                            <div id={`landing-board-title-wrap`} className={`landingBoardTitleWrap`}>
                                <i id={`landing-board-icon`} className={`landingBoardIcon fas fa-th-large`} aria-hidden={true} />
                                <h3 id={`landing-board-title`} className={`landingBoardTitle`}>
                                    {workspace.title}
                                </h3>
                            </div>
                            <span id={`landing-board-label`} className={`landingBoardLabel`}>
                                {`EXAMPLE BOARD`}
                            </span>
                        </div>
                        <div id={`landing-board-columns`} className={`landingBoardColumns`}>
                            {workspace.lists.map((list, listIndex) => (
                                <div key={`${workspace.id}-${listIndex}`} id={`landing-board-column-${listIndex}`} className={`landingBoardColumn`}>
                                    <div id={`landing-column-heading-${listIndex}`} className={`landingColumnHeading`}>
                                        <span id={`landing-column-dot-${listIndex}`} className={`landingColumnDot landingColumnDot${listIndex}`} aria-hidden={true} />
                                        <h4 id={`landing-column-title-${listIndex}`} className={`landingColumnTitle`}>
                                            {list.title}
                                        </h4>
                                        <span id={`landing-column-count-${listIndex}`} className={`landingColumnCount`}>
                                            {list.items.length}
                                        </span>
                                    </div>
                                    {list.items.map((item, itemIndex) => (
                                        <div
                                            key={item}
                                            id={`landing-preview-item-${listIndex}-${itemIndex}`}
                                            className={`landingPreviewItem ${listIndex === 2 ? `landingPreviewItemComplete` : ``}`}
                                        >
                                            <span id={`landing-preview-item-label-${listIndex}-${itemIndex}`} className={`landingPreviewItemLabel`}>
                                                {item}
                                            </span>
                                            <div id={`landing-preview-item-details-${listIndex}-${itemIndex}`} className={`landingPreviewItemDetails`}>
                                                <i id={`landing-preview-item-icon-${listIndex}-${itemIndex}`} className={`landingPreviewItemIcon fas fa-${listIndex === 2 ? `check-circle` : `tasks`}`} aria-hidden={true} />
                                                <span id={`landing-preview-item-status-${listIndex}-${itemIndex}`} className={`landingPreviewItemStatus`}>
                                                    {listIndex === 2 ? `Complete` : listIndex === 1 ? `In motion` : `Up next`}
                                                </span>
                                            </div>
                                            <span id={`landing-preview-progress-${listIndex}-${itemIndex}`} className={`landingPreviewProgress landingPreviewProgress${listIndex}`} aria-hidden={true} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div id={`landing-board-bottom`} className={`landingBoardBottom`}>
                            <i id={`landing-board-bottom-icon`} className={`landingBoardBottomIcon fas fa-check-double`} aria-hidden={true} />
                            <span id={`landing-board-bottom-text`} className={`landingBoardBottomText`}>
                                {`A clear view of what's next, what's moving, and what's done`}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section id={`landing-features`} className={`landingFeatures`} aria-labelledby={`landing-features-title`}>
                <div id={`landing-features-inner`} className={`landingInner`}>
                    <div id={`landing-features-heading`} className={`landingFeaturesHeading`}>
                        <p id={`landing-features-eyebrow`} className={`landingEyebrow`}>
                            {`THE BUILDING BLOCKS`}
                        </p>
                        <h2 id={`landing-features-title`} className={`landingSectionTitle`}>
                            {`Small details. Real momentum.`}
                        </h2>
                        <p id={`landing-features-description`} className={`landingDescription`}>
                            {`Everything you need to give your work a little more clarity.`}
                        </p>
                    </div>
                    <div id={`landing-feature-grid`} className={`landingFeatureGrid`}>
                        {landingFeatures.map((feature, index) => (
                            <div key={feature.id} id={`landing-feature-${feature.id}`} className={`landingFeature`}>
                                <div id={`landing-feature-top-${feature.id}`} className={`landingFeatureTop`}>
                                    <i id={`landing-feature-icon-${feature.id}`} className={`landingFeatureIcon fas fa-${feature.icon}`} aria-hidden={true} />
                                    <span id={`landing-feature-number-${feature.id}`} className={`landingFeatureNumber`}>
                                        {`0${index + 1}`}
                                    </span>
                                </div>
                                <h3 id={`landing-feature-title-${feature.id}`} className={`landingFeatureTitle`}>
                                    {feature.title}
                                </h3>
                                <p id={`landing-feature-description-${feature.id}`} className={`landingFeatureDescription`}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id={`landing-get-started`} className={`landingGetStarted`} aria-labelledby={`landing-get-started-title`}>
                <div id={`landing-get-started-inner`} className={`landingInner landingGetStartedInner`}>
                    <div id={`landing-get-started-copy`} className={`landingGetStartedCopy`}>
                        <p id={`landing-get-started-eyebrow`} className={`landingEyebrow`}>
                            <i id={`landing-device-icon`} className={`landingDeviceIcon fas fa-mobile-alt`} aria-hidden={true} />
                            <span id={`landing-device-label`} className={`landingDeviceLabel`}>
                                {`AT YOUR DESK. ON THE GO.`}
                            </span>
                        </p>
                        <h2 id={`landing-get-started-title`} className={`landingSectionTitle`}>
                            {`Your next idea starts here.`}
                        </h2>
                        <p id={`landing-get-started-description`} className={`landingDescription`}>
                            {`Open ProductIVF in your browser or install it as a web app. Your workspace is ready for the way you work.`}
                        </p>
                    </div>
                    <Link id={`landing-get-started-link`} className={`landingButton`} href={`/`}>
                        <span id={`landing-get-started-label`} className={`landingButtonLabel`}>
                            {`Let's Get Started`}
                        </span>
                        <i id={`landing-get-started-icon`} className={`landingButtonIcon fas fa-arrow-right`} aria-hidden={true} />
                    </Link>
                </div>
            </section>
        </main>
    );
};

export default Landing;
