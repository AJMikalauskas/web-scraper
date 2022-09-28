import cheerio, {load} from 'cheerio';
import fetch from 'node-fetch';
import express from 'express';
import fs  from 'fs/promises';
const PORT = 8000;
// Wrote script of start to run nodemon index.js --> npm run start?

//Initialize express
const app = express(); // use, get, listen. 
const url = 'http://omegajuicers.staging2.searchside.com/pages/juicer-index'; 
// Key: Name -> Value: Link
const fullPage = [];
const breadcrumbPages = [];
const headlineTxt= [];
const mainContentChildrenText = []

const scrapeSiteForAllData = async(url) => {
    const response = await fetch(url);
    const body = await response.text();    
    let $ = load(body);

    // Navbar like component; included in footer and header
    $('.breadcrumb').first().each((index, element) => {
        // Title of Page
        $(element).children('li').each((index,element) => { 
            // Breadcrumb page names
            let pageName = $(element).children('a').text();
            //console.log(pageName);
            
            // Link to prev or current page
            let pageLink = $(element).children('a').attr('href');
            //console.log(pageLink);
            breadcrumbPages.push({
                pageName,
                pageLink
            });
        });
    });
    console.log(breadcrumbPages);

    
    const Headline = $("#MainContent").children().first().children().id;
    console.log(Headline);

    // May want to specify in main for these, can also be a class of siteMap
    $("#MainContent").children().each((i, parentElement) => {
        // Recursion/iterable while loop
        // mainContentChildrenText[i] = $(this).text();
        const currentChild = $(parentElement).children().first().text();

        //console.log(currentChild);
        // while()
        // {

        // }
        //let childText = ;
        //while() {}
    })
    console.log(mainContentChildrenText);
        // Non-iterable 
        // const headline = $("#Headline").text();
        // console.log(headline);
        // headlineTxt.push({headline})

        // // Non-iterable 
        // const moreAndLessVisibility = $("#VisiblePageTitle").text();
        // console.log(moreAndLessVisibility);
}
// axios(url)
//     .then(response => {
//         const html = response.data;
//         // console.log(html); --> Web scrape from this HTML using cheerio
//         const htmlElements = cheerio.load(html);

//         // get element with class of breadcrumb
//         htmlElements('.breadcrumb').each(function() {
//             htmlElements(this).find('li').each(function() {
                
//             })
//         });
//         //console.log(amazonImgs);
//     }).catch(err => console.log(err));
// axios(url)
//     .then(response => {
//         const html = response.data;
//         // console.log(html); --> Web scrape from this HTML using cheerio
//         const htmlElements = cheerio.load(html);
//         // get element with class of a-dynamic-image
//         htmlElements('#mainImageContainer').each(function() {
//             //htmlElements(this).text()
//             const imgUrl = htmlElements(this).find('img').attr('src');
//             amazonImgs.push(imgUrl);
//         });
//         console.log(amazonImgs);
//     }).catch(err => console.log(err));

scrapeSiteForAllData(url);
app.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
