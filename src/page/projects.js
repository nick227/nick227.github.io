import { projectsData } from './projectsData.js';

export class Projects {
    #projects;

    constructor(container) {
        this.#projects = projectsData;
        this.container = container;
    }

    getProjects(){
        let result = "";
        this.#projects.forEach((project) => {
            result += this.generateFragment(project)
        })
        return result;
    }

    generateFragment(project){
        const html = `<div class="project-item">
            <div class="row w-full">
                <div class="col-50">
                    <h3>${project.title}</h3>
                    <p>${project.subText}</p>
                </div>
                <div class="col-50">
                    <div class="keywords align-right">
                        ${project.keywords.map((keyword) => `<div class="chip">${keyword}</div>`).join("")}
                    </div>
                </div>
            </div>
            <div class="more-info w-full">
                <p>${project.paragraph}</p>
                ${project.link ? `<ul><li><a href="${project.link}" target="_blank" rel="noopener noreferrer">${project.link}</a></li></ul>` : ''}
            </div>
        </div>`;

        return html;
    }
}
