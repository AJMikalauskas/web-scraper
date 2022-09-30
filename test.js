const puppeteer = require("puppeteer");
var JSSoup = require('jssoup').default;


// Global Storage of URLs
const allUrls = [];
let alreadySearchedThroughPages = [];

async function webScraper(url) {
    // Replicates opening browser, new page, and going to a url with that page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //const tstVal = document.querySelector("#MainContent").children[4];
    //console.log(tst.children.length)

    await page.goto(url);
    console.log(url);
    let childrenToIterate = await page.evaluate(() => {
        let idsOfChildren = [];
        // Make hrefs a dictionary so that we can remove repeat URLs
        let linksToOtherPages =  {};
        // let aHrefs = [];
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
                    // add to ternary for currentParent.children[i].innerText.trim() != ""
                    let textOfLowestChild = currentParent.children[i].innerText ? currentParent.children[i].innerText 
                    : currentParent.children[i].innerHTML ? currentParent.children[i].innerHTML : "";
                    // ${specifier} > ${tagAndClassId} > ${noChildrenTagAndClassId}
                    let specifierCheck = specifier != undefined ? `${specifier} > ${tagAndClassId} > ${noChildrenTagAndClassId}`
                    : `${tagAndClassId} > ${noChildrenTagAndClassId}`;

                    //Image or a Tag logic --> Image will never be a parent to anything but a tag has the possibility to be.
                        // May not be final logic, these handle the instance where an a tag of img tag has no children
                            // Is by default the img tag going to have no children?
                            // Correct Amount of imgSrcs but I don't know about aHrefs, test it in another page?
                            // How to optimize a tag logic, maybe not and even if I did would it really quote and quote optimize
                            // the code? It would just be another complicated if statement after this and I know that scope is very wide in
                            // JS, but that would probably abuse scope.
                    if(noChildrenTag == "a" || noChildrenTag == "img")
                    {
                        let hrefLink = currentParent.children[i].href;
                        if(noChildrenTag == "a" && !Object.keys(linksToOtherPages).includes(hrefLink))
                        {
                            linksToOtherPages[hrefLink]  = specifierCheck;
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
                    let hrefLink = currentParent.href;
                    if(tag == "a" && !Object.keys(linksToOtherPages).includes(hrefLink))
                    {
                        let specifierForATag = specifier != undefined ? `${specifier} > ${tagAndClassId}`: `${tagAndClassId}`;
                        linksToOtherPages[hrefLink] = specifierForATag;
                    } 

                    // This is to account for the times where there is text in the currentParent
                    // May need to remove cases where the text is only escape characters such as \n or \t
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
        const topLevelTag = document.querySelector("body");
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
        // const testChild = Array.from(document.querySelector('#MainContent').children[1].childNodes);
        // let filteredOutChildren = testChild.filter(element => 
        //      element.tagName == undefined
        // )
        // childNodes will select all nodes inclduing just the text that isn't actually a child tag but just child text.
        //const testChild1 = document.querySelector("#MainContent").children[4].children[0].children[0].children[0].children[1].children[0];
        // Testing Dictionaries
        // const dict = {
        //     example1: "example",
        //     "test1": "test",
        //     "test3": "test2"
        // }
        //Object.values(dict).includes("text2")

        return linksToOtherPages;
       // How to add imgSrcs and aHrefs to return with idsOfChildren?
    })
    // if(Object.values(childrenToIterate).includes(url))
    // {
    // }
    // Filter out current page URL --> may change to be based on values later based on keys as URLS/Hrefs for now
    alreadySearchedThroughPages.push(url);
    //console.log(childrenToIterate)
    let newListOfPages = Object.keys(childrenToIterate)
        .filter(keyHrefLink => !alreadySearchedThroughPages.includes(keyHrefLink) && keyHrefLink.trim() !== "" && !allUrls.includes(keyHrefLink))
        .reduce((acc,key) => {
            acc[key] = childrenToIterate[key]; 
            return acc;
        }, {});
    //console.log(newListOfPages)
        // The 1st if check is to check to make syure we aren't adding the current url to the urls we still need to go through 
        // and not adding URLs that we've already went through; 2nd if check s just to remove the weird instace of URL where it was empty string
        // The 3rd check is to filter out urls that are already in global allUrls, 
        // if filter returns false not added to filtered array, in filter above too

        //console.log(Object.keys(newListOfPages))
        //console.log(newListOfPages);

        // for(var urlsFromIdx = 0; urlsFromIdx < Object.keys(newListOfPages).length; urlsFromIdx++)
        // {
        // Call webScraper(Object.keys(newListOfPages)[urlsFromIdx])
        // Doing so would be the long call of all URLS, will do later?
        // }

    await browser.close();
    //console.log(newListOfPages);
    return newListOfPages;
};

async function goThroughPageUrls() {
    let homePageUrls = await webScraper("http://omegajuicers.staging2.searchside.com/pages/juicer-index");
    //console.log(Object.keys(homePageUrls).length);
    //Object.keys(homePageUrls).length
    for(var urlsFromIdx = 0; urlsFromIdx < Object.keys(homePageUrls).length; urlsFromIdx++)
    {
        //console.log(Object.keys(homePageUrls)[urlsFromIdx]);
        let currentUrlBeingSearched = Object.keys(homePageUrls)[urlsFromIdx];
        console.log(currentUrlBeingSearched)
        let urlsOnAPage = await webScraper(currentUrlBeingSearched);
        allUrls.push(...Object.keys(urlsOnAPage));
        console.log(`Added ${Object.keys(urlsOnAPage).length} URLs; 
        New Url Count: ${allUrls.length}, Old Url Count: ${allUrls.length - Object.keys(urlsOnAPage).length}`);
    }
    // Call webScraper(Object.keys(homePageUrls)[urlsFromIdx])
    // Doing so would be the long call of all URLS, will do later?
    //let urlsOnAPage = await webScraper(Object.keys(homePageUrls)[0]);
    //allUrls.push({ urlsInChildUrl: Object.keys(urlsOnAPage).length});

    // Need to filter out the results we already have
}

goThroughPageUrls();
//console.log(allUrls.length);
//console.log(allUrls);