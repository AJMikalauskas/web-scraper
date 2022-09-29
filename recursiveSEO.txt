const puppeteer = require("puppeteer");
var JSSoup = require('jssoup').default;

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
        let aHrefs = [];
        let imgSrcs = [];
        let specialInstancesOfTextInParent = [];
        function recurseThroughTags(currentParent, specifier) {
            for(var i = 0; i < currentParent.children.length; i++)
            {
                // add to specifier by += and >
                let tag = currentParent.tagName.toLowerCase();
                let classId = currentParent.className ? `.${currentParent.className}` 
                : currentParent.id ? `#${currentParent.id}` : "";
                let tagAndClassId = `${tag} ${classId ? classId: ""}`;

                // Children Recursion Logic
                if(currentParent.children[i].children.length > 0)
                {
                    //console.log(tagAndClassId);
                    // ${!!specifier ? `${specifier} > ${tagAndClassId}` : `${tagAndClassId}`}
                    let specifierParam = specifier != undefined ? `${specifier} > ${tagAndClassId}`: `${tagAndClassId}`;
                    recurseThroughTags(currentParent.children[i], specifierParam)
                }
                else 
                {
                    let noChildrenTag = currentParent.children[i].tagName.toLowerCase();
                    let noChildrenClassId = currentParent.children[i].className ? `.${currentParent.children[i].className}` 
                    : currentParent.children[i].id ? `#${currentParent.children[i].id}` : "";
                    let noChildrenTagAndClassId = `${noChildrenTag} ${noChildrenClassId ? noChildrenClassId : ""}`;
                    let textOfLowestChild = currentParent.children[i].innerText.trim() != "" ? currentParent.children[i].innerText 
                    : currentParent.children[i].innerHTML ? currentParent.children[i].innerHTML : "";

                    // ${specifier} > ${tagAndClassId} > ${noChildrenTagAndClassId}
                    let specifierCheck = specifier != undefined ? `${specifier} > ${tagAndClassId} > ${noChildrenTagAndClassId}`
                    : `${tagAndClassId} > ${noChildrenTagAndClassId}`;

                    //Image or a Tag logic --> Image will never be a parent to anything but a tag has the possibility to be.
                        // May not be final logic, these handle the instance where an a tag of img tag has no children
                            // Is by default the img tag going to have no children?
                            // Correct Amount of imgSrcs but I don't know about aHrefs, test it in another page?
                    if(noChildrenTag == "a" || noChildrenTag == "img")
                    {
                        if(noChildrenTag == "a")
                        {
                            aHrefs.push({ specifier: specifierCheck, hrefLink: currentParent.children[i].href})
                        } else if(noChildrenTag =="img"){
                            imgSrcs.push({ specifier: specifierCheck, srcLink: currentParent.children[i].src})
                        }
                    }
                    idsOfChildren.push({specifier: specifierCheck, text: textOfLowestChild})
                }

                //Image or a Tag logic --> Image will never be a parent to anything but a tag has the possibility to be.
                    // I This may be able to be handled after the if else below and may bee able to handle both cases where
                    // The way to remove duplicates of it is to only add parent a tags when its on the last iteration
                    // of its children. 
                if(i == currentParent.children.length - 1)
                {
                    if(tag == "a")
                    {
                        let specifierForATag = specifier != undefined ? `${specifier} > ${tagAndClassId}`: `${tagAndClassId}`;
                        aHrefs.push({ specifier: specifierForATag, hrefLink: currentParent.href})
                    } 
                    const allNodesIncludingTxtOfParent = Array.from(currentParent.childNodes);
                    let filteredOutTags = allNodesIncludingTxtOfParent.filter(element => 
                         element.tagName == undefined
                    );
                    let text = "";
                    if(filteredOutTags.length > 0)
                    {
                        for(let textNodeNum = 0; textNodeNum < filteredOutTags.length; textNodeNum++)
                        {
                            text += filteredOutTags[textNodeNum].textContent;
                        }
                        let specifierForSpecialInstances = specifier != undefined ? `${specifier} > ${tagAndClassId}`: `${tagAndClassId}`;
                        specialInstancesOfTextInParent.push({specifier: specifierForSpecialInstances, specialTxt: text})
                    }
                    
                }
            }
        }
        const topLevelTag = document.querySelector("#MainContent");
        recurseThroughTags(topLevelTag);

        // let tagName = iterableSubFourChild.tagName.toLowerCase();
        // let classOrId = iterableSubFourChild.className ? `.${iterableSubFourChild.className}` 
        // : iterableSubFourChild.id ? `#${iterableSubFourChild.id}` : "";

        // let specifier = `${tagName} ${classOrId}`;
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
        
        // a tag test
            //const testChild = document.querySelector("#MainContent").children[4].children[0].children[0].children[0].children[1].children[0].tagName;
        // img tag test
            //const testChild1 = document.querySelector("#MainContent").children[4].children[0].children[0].children[0].children[1].children[0].children[0].tagName;
        // Should result in 1 as the li element --> PASSED

        //var soup = new JSSoup(`${document.querySelector("#MainContent").children[2].innerHTML}`);
        //var tag = soup.find(text=True, recursive=False);
        const testChild = Array.from(document.querySelector('#MainContent').children[1].childNodes);
        let filteredOutChildren = testChild.filter(element => 
             element.tagName == undefined
        )
        // childNodes will select all nodes inclduing just the text that isn't actually a child tag but just child text.
        const testChild1 = document.querySelector("#MainContent").children[4].children[0].children[0].children[0].children[1].children[0];
        return specialInstancesOfTextInParent;
       // How to add imgSrcs and aHrefs to return with idsOfChildren?
    })
    console.log(childrenToIterate);
    await browser.close();
};

webScraper("http://omegajuicers.staging2.searchside.com/pages/juicer-index");

// const addTwoNums = (a,b)  => {
//     return a+b;
// }

// addTwoNums(3,4);