//import puppeteer from 'puppeteer';
// Saving Data we scrape from pages to a new text file

// import fs from 'fs/promises';
// import $ from "jquery";
// Screenshot the page URL in which we visit
    // await page.screenshot({ path: "test.png", fullPage: true})
// 1st param is file we want to create, and 2nd param is what we want to write to the file, so written on new line  use .join("\r\n")
//const names = ["red","orange", "yellow"];
    // const idsOfMainContentChildren = await page.evaluate(() => {
    //     // return so it adds to the writeFile()
    //     // console.log($("#productTitle")).map(x => x.textContent); // May only be 1 since it's an amazon page, but there can be multiple due to Array.from()
    //     const mainContentElemChildren = document.getElementById("#MainContent");
    //     console.log(mainContentElemChildren);
    //     //return Array.from().map(x => x.id)
    //     //const mainContentParent = $("#MainContent")
    // })
    //console.log(idsOfMainContentChildren());
    //await fs.writeFile("webscrape.txt", titles.join("\r\n"))
    // Chrome DevTools, click on wanted element
    // right click in dev tools and-> copy -> copy xpath
    // selects by xpath; jquery can also do this.
    // array destructure 1st item into const el.
    //const [el] = page.$x('//*[@id="imgBlkFront"]');
    // Get img source, image should be in el
    // const src = await el.getProperty('src');
    // const srcTxt = await src.jsonValue();

    // console.log({srcTxt});

// Pass in URL to page you want to web scrape for later. For now, hard code in URL
const puppeteer = require('puppeteer');
(async() => {
    // Replicates opening browser, new page, and going to a url with that page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // pass in URL as param later
    await page.goto("http://omegajuicers.staging2.searchside.com/pages/juicer-index")
    const mainContent = document.querySelector("#MainContent");
    console.log(mainContent.children[4]);

    // copy > copy selector on right click of elements in chrome dev tools
    const childrenToIterate = await page.evaluate(() => {
        const idsOfChildren = [];
        function recurseThroughTags(children, specifier) {
            debugger;
            for(var i = 0; i < children.length; i++)
            {
                if(children[i].children > 0)
                {
                    // add to specifier by += and >
                    let tag = children.children[i].tagName.toLowerCase();
                    let classId = children.children[i].className ? `.${children.children[i].className}` : `#${children.children[i].id}`;
                    let tagAndClassId = `${tag} ${classId ? classId: ""}`;
                    //console.log(tagAndClassId);
                    recurseThroughTags(children[i].children, `${specifier} > ${tagAndId}`)
                }else 
                {
                    let textOfLowestChild = children.innerText;
                    idsOfChildren.push({specifier, text: textOfLowestChild})
                }
            }
        }
        const mainContent = document.querySelector("#MainContent");

        //const childrenTagsOfParent = mainContent.children[4];
        const iterateOverChildren = mainContent.children[4];
        let tstTag = iterateOverChildren.tagName;

        // id is blank string if it doesn't exist, 
        let tstIdOrClass = iterateOverChildren.className ? iterateOverChildren.className: iterateOverChildren.id;
        let tagAndId = `${tstTag} #${tstIdOrClass}`;
        console.log(tagAndId);

        // let tag = mainContent.children[4].tagName.toLowerCase();
        // ternary operation if no id, use class instead?
        // let id = mainContent.children[4].id;
        // let tagAndId = `${tag} #${id}`;
        if(iterateOverChildren.length > 0)
        {
            recurseThroughTags(iterateOverChildren, tagAndId);
        }
        //idsOfChildren.push({ specifier: tagAndId, text : mainContent.children[0].innerText })
        // Need way to iterate over things that have multiple layers of divs
        //let testingVar = mainContent.children[4].innerText;
        //? THIS CODE WORKS FOR GETTING id and text of children
        // for(let i = 0; i < mainContent.children.length; i++)
        // {
        //     let id = mainContent.children[i].id;
        //     let tstText = mainContent.children[i].innerText;
        //     idsOfChildren.push({ id , text: tstText });
        // }
        return idsOfChildren;
        // return mainContent.firstElementChild.id;
    })
    console.log(childrenToIterate);
    await browser.close()   
})();

//scrapeProduct("http://omegajuicers.staging2.searchside.com/pages/juicer-index");

