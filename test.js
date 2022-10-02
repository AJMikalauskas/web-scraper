const puppeteer = require("puppeteer");
var JSSoup = require('jssoup').default;


// Global Storage of URLs
const allUrls = [];
let alreadySearchedThroughPages = [];

// This function has the ability to get all the URLs, image sources and more
    // - idsOfChildren loops thorugh everything and finds bottomomost child elements that don't have children and prints them and 
    // the text inside them, Array of object, could be a dictionary if necessary
        // - linksToOtherPages finds all the a tags whether they're parents or child tags and adds them to this dictionary/object
        // Logic could be optimized for thit but it also works for the times where there is text within a parent component
            // - imgSrcs gets the image sources, The logic assumes that the image tags are always children, they will never 
            // be parent tags to other child tags.
                // specialInstancesOfTextInParent handles the cases where there is text in the parent component that isn't accounted
                // for due to .children only containg children tags while childNodes contains both the tags and text at parent level
// Takes about 10 minutes when going though about 150 URLs and pulling and filtering them to add into an array containing all URLs to 
    // loop through
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
// Optimization May be possible for webScraper() if I wasn't searching for the many different things 
// including imgs and more.
// I added functions below to handle seeing if images have the alt tags
// Also, I added SEO checks for the head tag inclduing the description, title, keywords
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
        // AllUrls would be ever increasing --> This would take forever, but I wish we coukdlld grow in time complexity exponentially based on 
        // there being more results would actually help because you could break from the for loop in recursion rather than adding every url
        // and then filtering
        for(var urlInAllUrls = 0; urlInAllUrls < allUrls.length; urlInAllUrls++)
        {
            let innerMoreUrls = await webScraper(allUrls[urlInAllUrls]);
            allUrls.push(...Object.keys(innerMoreUrls));
        }
        console.log(`Added ${Object.keys(urlsOnAPage).length} URLs; 
        New Url Count: ${allUrls.length}, Old Url Count: ${allUrls.length - Object.keys(urlsOnAPage).length}`);
    }
    // Call webScraper(Object.keys(homePageUrls)[urlsFromIdx])
    // Doing so would be the long call of all URLS, will do later?
    //let urlsOnAPage = await webScraper(Object.keys(homePageUrls)[0]);
    //allUrls.push({ urlsInChildUrl: Object.keys(urlsOnAPage).length});

    // Need to filter out the results we already have
    let end = new Date();
    console.log(`${end}`);
}
// function timeTheRecursion() { 
//     let start = new Date();
//     console.log(`${start}`);

//     goThroughPageUrls();
    
// }
// timeTheRecursion();

// Get all information SEO related image alt checks and head checks
async function webScraperHeaderSeo(url) {
    // Replicates opening browser, new page, and going to a url with that page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);
    //console.log(url);
     let childrenToIterate = await page.evaluate(() => {
        let imgTags = [];

        function recurseThroughTags(currentParent, specifier) {
            for(var i = 0; i < currentParent.children.length; i++)
            {
                // add to specifier by += and >
                let tag = currentParent.tagName.toLowerCase();
                let classId = currentParent.className ? `.${currentParent.className}` 
                : currentParent.id ? `#${currentParent.id}` : "";
                let tagAndClassId = `${tag} ${classId ? classId: ""}`;
                let noChildrenTag = currentParent.children[i].tagName.toLowerCase();

                // Children Recursion Logic
                if(currentParent.children[i].children.length > 0)
                {
                    //console.log(tagAndClassId);
                    // ${!!specifier ? `${specifier} > ${tagAndClassId}` : `${tagAndClassId}`}
                    let specifierParam = specifier != undefined ? `${specifier} > ${tagAndClassId}`: `${tagAndClassId}`;
                    recurseThroughTags(currentParent.children[i], specifierParam)
                }
                else if(noChildrenTag === "img")
                {
                    let noChildrenClassId = currentParent.children[i].className ? `.${currentParent.children[i].className}` 
                    : currentParent.children[i].id ? `#${currentParent.children[i].id}` : "";
                    let noChildrenTagAndClassId = `${noChildrenTag} ${noChildrenClassId ? noChildrenClassId : ""}`;
                    let specifierCheck = specifier != undefined ? `${specifier} > ${tagAndClassId} > ${noChildrenTagAndClassId}`
                    : `${tagAndClassId} > ${noChildrenTagAndClassId}`;

                    // I don't see where the img tag would be a parent tag in any case, did about 10 searches and found nothing
                        // need if for noChildrenTag being img
                    imgTags.push({ specifier: specifierCheck, altTagExists: currentParent.children[i].alt != ""})
                }
            }
        }
        const imgsInBody = document.querySelector("body");
        recurseThroughTags(imgsInBody);

        // const testImgTag = document.querySelector("#MainContent").children[4].children[0].children[0].
        // children[0].children[1].children[0].children[0].alt;
            // Typescript mentality to not just change the preset false value to th string of content
            // Need icon ico link rel in head for pages too, but won't add here for now
        const metaSeoChecks = { description: { content: "", exists:false}, charset: {exists:false},
        keywords: { content: "", exists:false}, viewport: { content: "", exists:false}, 
        httpEquiv: { httpEquivTxt: "", content: "", exists:false},
        title: { content: "", exists:false}};
        const otherMetaTagsAndSeo = [];
        function recurseThroughHeaderTags(currentParent) {
            for(var i = 0; i < currentParent.children.length; i++)
            {
                let currentChildTagName = currentParent.children[i].tagName.toLowerCase(); 
                if(currentChildTagName === "meta")
                {
                    if(currentParent.children[i].name !== "")
                    {
                        let metaTagNameProperty = currentParent.children[i].name;
                        switch(metaTagNameProperty) {
                            case "description": 
                                metaSeoChecks.description.content = currentParent.children[i].content;
                                metaSeoChecks.description.exists = true;
                                break;
                            case "keywords": 
                                metaSeoChecks.keywords.content = currentParent.children[i].content;
                                metaSeoChecks.keywords.exists = true;
                                break;
                            case "viewport": 
                                metaSeoChecks.viewport.content = currentParent.children[i].content;
                                metaSeoChecks.viewport.exists = true;
                                break;
                            default:
                                otherMetaTagsAndSeo.push(currentParent.children[i]);
                        }
                    } else if(currentParent.children[i].attributes[0].textContent == "utf-8")
                    {
                        metaSeoChecks.charset.exists = true;
                    } else if(currentParent.children[i].httpEquiv !== "")
                    {   
                        metaSeoChecks.httpEquiv.httpEquivTxt = currentParent.children[i].httpEquiv;
                        metaSeoChecks.httpEquiv.content = currentParent.children[i].content;
                        metaSeoChecks.httpEquiv.exists = true;
                    } 
                } else if(currentChildTagName === "title") {
                    metaSeoChecks.title.content = currentParent.children[i].textContent;
                    metaSeoChecks.title.exists = true;
                }
            }
        }
        const headerSeo = document.querySelector("head");
        recurseThroughHeaderTags(headerSeo);
        //const tstHeaderSeo = document.querySelector("head").children[1].attributes[0].textContent;

        return {imgTags, metaSeoChecks};
    })
        // {imgTags};
       // How to add imgSrcs and aHrefs to return with idsOfChildren? --> can return as object and accessValues if neccessary
   // })
    //console.log(childrenToIterate.imgTags);
    //console.log(childrenToIterate.metaSeoChecks)
    // Filter out current page URL --> may change to be based on values later based on keys as URLS/Hrefs for now
    // alreadySearchedThroughPages.push(url);
    // let newListOfPages = Object.keys(childrenToIterate)
    //     .filter(keyHrefLink => !alreadySearchedThroughPages.includes(keyHrefLink) && keyHrefLink.trim() !== "" && !allUrls.includes(keyHrefLink))
    //     .reduce((acc,key) => {
    //         acc[key] = childrenToIterate[key]; 
    //         return acc;
    //     }, {});
    await browser.close();
    return {imgTags: childrenToIterate.imgTags, metaSeoChecks: childrenToIterate.metaSeoChecks};
};
// webScraperHeaderSeo("http://omegajuicers.staging2.searchside.com/pages/juicer-index");

async function goThroughPageUrlsSeo() {
    let homePageUrls = await webScraper("http://omegajuicers.staging2.searchside.com/pages/juicer-index");
    for(var urlsFromIdx = 0; urlsFromIdx < Object.keys(homePageUrls).length; urlsFromIdx++)
    {
        //console.log(Object.keys(homePageUrls)[urlsFromIdx]);
        let currentUrlBeingSearched = Object.keys(homePageUrls)[urlsFromIdx];
        console.log(currentUrlBeingSearched)
        let seoChecks = await webScraperHeaderSeo(currentUrlBeingSearched);
        // allUrls.push(...Object.keys(urlsOnAPage));
        let imgsThatNeedAltTags = seoChecks.imgTags.filter(img => !img.altTagExists);
        if(imgsThatNeedAltTags.length > 0)
        {
            for(let imgNeedingFixingNum = 0; imgNeedingFixingNum < imgsThatNeedAltTags.length; imgNeedingFixingNum++)
            {
                console.log(`Need to add alt tag description to this image specifier: ${imgsThatNeedAltTags[imgNeedingFixingNum].specifier}`)
            }
        } else {
            console.log("This Page Has No Img Tags To Fix, Great!")
        }
        for (const seoProperty in seoChecks.metaSeoChecks) {
            if(!seoChecks.metaSeoChecks[seoProperty].exists)
            {
                console.log(seoProperty);
                console.log(`I'd recommend you add ${seoProperty} to the head`)
            } 
            // else {
              //  console.log(`Great, it seems you included ${seoProperty}`)
            // }
        }
    }
    let end = new Date();
    console.log(`${end}`);
}
//  Took 11 minutes and 16 seconds
// function timeTheRecursion() { 
//      let start = new Date();
//      console.log(`${start}`);
//      goThroughPageUrlsSeo();
// }
// timeTheRecursion();
//goThroughPageUrlsSeo();