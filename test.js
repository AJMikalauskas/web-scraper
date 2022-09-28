const puppeteer = require("puppeteer");

async function webScraper(url) {
    // Replicates opening browser, new page, and going to a url with that page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //const tstVal = document.querySelector("#MainContent").children[4];
    //console.log(tst.children.length)

    // pass in URL as param later
    await page.goto(url);
    let childrenToIterate = await page.evaluate(() => {
        let idsOfChildren = [];
        function recurseThroughTags(currentParent, specifier) {
            for(var i = 0; i < currentParent.children.length; i++)
            {
                // add to specifier by += and >
                let tag = currentParent.tagName.toLowerCase();
                let classId = currentParent.className ? `.${currentParent.className}` 
                : currentParent.id ? `#${currentParent.id}` : "";
                let tagAndClassId = `${tag} ${classId ? classId: ""}`;
                
                if(currentParent.children[i].children.length > 0)
                {
                    //console.log(tagAndClassId);
                    recurseThroughTags(currentParent.children[i], `${specifier != undefined ? `${specifier} > ${tagAndClassId}` : tagAndClassId}`)
                }
                else 
                {
                    let noChildrenTag = currentParent.children[i].tagName.toLowerCase();
                    let noChildrenClassId = currentParent.children[i].className ? `.${currentParent.children[i].className}` 
                    : currentParent.children[i].id ? `#${currentParent.children[i].id}` : "";
                    let noChildrenTagAndClassId = `${noChildrenTag} ${noChildrenClassId ? noChildrenClassId : ""}`;
                    let textOfLowestChild = currentParent.children[i].innerText.trim() != "" ? currentParent.children[i].innerText 
                    : currentParent.children[i].innerHTML ? currentParent.children[i].innerHTML : "";
                    idsOfChildren.push({specifier: `${specifier} > ${tagAndClassId} > ${noChildrenTagAndClassId}`, text: textOfLowestChild})
                }
            }
        }
        const topLevelTag = document.querySelector("#MainContent");
        // let tagName = iterableSubFourChild.tagName.toLowerCase();
        // let classOrId = iterableSubFourChild.className ? `.${iterableSubFourChild.className}` 
        // : iterableSubFourChild.id ? `#${iterableSubFourChild.id}` : "";

        // let specifier = `${tagName} ${classOrId}`;
        recurseThroughTags(topLevelTag)
        //console.log(iterableSubFourChild.children)
        // const mainContent = document.querySelector("#MainContent");
        // mainContent.children.forEach((child) => {
        //     let tstTagName = iterateOverChildren.tagName;
        //     // 1st priority is className and then 2nd is id.
        //     let tstIdOrClass = iterateOverChildren.className ? iterateOverChildren.className: iterateOverChildren.id;
        //     let tagAndId = `${tstTag} #${tstIdOrClass}`;

        //     if(child.children.length > 0)
        //     {
        //         recurseThroughTags(child.children, tagAndId);
        //     }
        // })
        //return iterableSubFourChild.children.length;
        //const testChild = document.querySelector("#MainContent").children[4].children[0].children[0].children[0].children[0].className;
        // Should result in 1 as the li element --> PASSED

        return idsOfChildren;
    })
    console.log(childrenToIterate);
    await browser.close();
};

webScraper("http://omegajuicers.staging2.searchside.com/pages/juicer-index");

// const addTwoNums = (a,b)  => {
//     return a+b;
// }

// addTwoNums(3,4);