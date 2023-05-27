import { StateContext, createXML, formatDate, dev } from '../pages/_app';
import { useContext, useEffect, useState, useRef } from 'react';

export default function Projects() {
  const initialLoad = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const [overrideUser, setOverrideUser] = useState<any>(null);

  // Github
  const getGithubData = async () => {
    let username = `strawhat19`;
    const repoURL = `https://api.github.com/users/${username}/repos`;
    const githubURL = `https://api.github.com/users/${username}`;
    const repositories = JSON.parse(localStorage.getItem(`repositories`) as string) || [];
    const responseRepos = await fetch(repoURL);
    const response = await fetch(githubURL);

    if (!response.ok || !responseRepos.ok) {
      console.log(`Fetch Error`);
      console.clear();
    } else {
      // Get Github Info
      const github = await response.json();
      const githubRepos = await responseRepos.json();
      const { name, html_url, bio, blog, avatar_url, login, public_repos, repos_url, starred_url, followers, following } = github;
      githubRepos.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((repo: any) => {
        const { name, html_url, created_at, owner, topics, license, updated_at, deployments_url, language, homepage, description } = repo;
        const filteredRepo = { name, owner, url: html_url, topics, date: created_at, license, updated: updated_at, homepage, language, deployment: deployments_url, description };
        repositories.push(filteredRepo);
      });
      const gitUser = { id: `1 Rakib 5:21 AM 12-21-2022`, name, url: html_url, bio, projects: repositories.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()), website: blog, avatar: avatar_url, login, repoLink: repos_url, repoNum: public_repos, starred: starred_url, followers, following, lastSignin: formatDate(new Date()) };

      setOverrideUser(gitUser);
      setProjects(gitUser?.projects);
      console.log(`Updated Projects`, gitUser?.projects);
      localStorage.setItem(`projects`, JSON.stringify(gitUser?.projects));
    //   if (overrideUser) {
        // getDefaultUser().then((usr: any) => {
        //   setUser({...usr, ...user, ...gitUser, projects: gitUser?.projects});
        //   console.log(`Updated User`, {...usr, ...user, ...gitUser, projects: gitUser?.projects});
        //   localStorage.setItem(`user`, JSON.stringify({...usr, ...user, ...gitUser, projects: gitUser?.projects}));
        // });
    //   }
    };
  }

  const getTopicBadgeUrl = (topic, style = 'for-the-badge', logo = 'appveyor') => {
    const url = `https://img.shields.io/badge/${encodeURIComponent(topic)}-${encodeURIComponent(``)}-${encodeURIComponent('blue')}.svg?style=${encodeURIComponent(style)}&logo=${encodeURIComponent(logo)}`;
  
    return url;
  }

  const getTopicBadges = async (topics) => {
    const badges = [];
  
    for (const topic of topics) {
      try {
        const response = await fetch(`https://img.shields.io/badge/${encodeURIComponent(topic)}-${encodeURIComponent('topic')}-${encodeURIComponent('blue')}`);
        if (response.ok) {
          const svg = await response.text();
          badges.push(svg);
        } else {
          console.error(`Failed to fetch badge for topic "${topic}"`);
        }
      } catch (error) {
        console.error(`Error fetching badge for topic "${topic}": ${error}`);
      }
    }
  
    return badges.join('\n');
  }
  

  useEffect(() => {
    let firstLoad = !initialLoad.current;
    let updated = initialLoad.current;
    let cachedUser = JSON.parse(localStorage.getItem(`user`) as any);
    let cachedProjects = JSON.parse(localStorage.getItem(`projects`) as any) || [];

    if (firstLoad) {
      setLoaded(true);
    //   setPage(`Projects`);
    //   setUpdates(updates+1);

      if (cachedProjects.length > 0) {
        console.log(`Cached Projects`, cachedProjects);
        setProjects(cachedProjects);
      } else {
        getGithubData();
      };
    }

    return () => {initialLoad.current = true;};
  }, [])

  return <section id={`projectsSection`}>
    <div className="flex projects items">
        {projects.length > 0 ? projects.map((project: any, projectIndex: any) => {
            return (
              <div className={`project flex row`} key={projectIndex} id={project?.name}>
                <div className="inner row flex">
                  <div className="projectOrder itemOrder">{projectIndex + 1}</div>
                  <div className="projectContents flex">
                    <div className="projectLinks">
                      <a target={`_blank`} href={project?.url} className={`projectName projectLink hoverLink`}>{project?.name}</a>
                      {project?.homepage && project?.homepage != `` && <a title={`View the Live Link`} target={`_blank`} href={project?.homepage}><i className="fas fa-globe-americas"></i></a>}
                      <a title={`View the Code`} href={project?.url} target={`_blank`}><i className="fab fa-github"></i></a>
                    </div>
                    {overrideUser && <div className={`avatarAndUser`}>
                      <img alt={`Project Owner`} src={overrideUser?.avatar} className={`projectAvatar`} />
                      <a href={project?.owner?.html_url} target={`_blank`} className={`gitUserNameLink hoverLink`}>by {overrideUser?.login}</a>
                    </div>}
                    <div className="projectTopics flex row">
                      {project?.topics.length > 0 && project?.topics.map((topic, topicIndex) => {
                        return (
                          <div key={topicIndex} className={`projectTopic dubscript`}>
                            {/* {topic} */}
                            <img alt={`Topic Badge`} className={`topicBadge`} src={getTopicBadgeUrl(topic, `for-the-badge`, topic)} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="projectEnd flex">
                    <span className={`projectDate projectCreated subscript`}>
                      <span className="slashes">Created:</span> {formatDate(new Date(project?.date))}</span>
                    <span className={`projectDate projectUpdated subscript`}>
                      <span className="slashes">Updated:</span> {formatDate(new Date(project?.updated))}</span>
                  </div>
                </div>
              </div>
            )
        }) : <div className={`skeleton`}>
            <h4 className={`skeletonItem`}>Loading...</h4>  
        </div>}
    </div>
</section>
}