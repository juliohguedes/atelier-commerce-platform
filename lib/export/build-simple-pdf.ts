function  escapePdfText(value:  string):  string  {
    return  value.replace(/\\/g,  "\\\\").replace(/\(/g,  "\\(").replace(/\)/g,  "\\)");
}

function  normalizePdfLine(value:  string):  string  {
    return  value
        .replace(/\r\n/g,  "\n")
        .replace(/\r/g,  "\n")
        .split("\n")
        .join("  ");
}

interface  SimplePdfOptions  {
    title:  string;
    lines:  string[];
}

export  function  buildSimplePdf({  title,  lines  }:  SimplePdfOptions):  Uint8Array  {
    const  maxLinesPerPage  =  42;
    const  normalizedLines  =  [title,  "",  ...lines].map((line)  =>  normalizePdfLine(line));
    const  pages:  string[][]  =  [];

    for  (let  index  =  0;  index  <  normalizedLines.length;  index  +=  maxLinesPerPage)  {
        pages.push(normalizedLines.slice(index,  index  +  maxLinesPerPage));
    }

    if  (pages.length  ===  0)  {
        pages.push([title]);
    }

    const  objects:  string[]  =  [];
    const  pageObjectIds:  number[]  =  [];
    const  contentObjectIds:  number[]  =  [];
    const  pagesRootId  =  2;
    const  fontObjectId  =  3;
    let  nextObjectId  =  4;

    for  (const  pageLines  of  pages)  {
        const  pageObjectId  =  nextObjectId++;
        const  contentObjectId  =  nextObjectId++;
        pageObjectIds.push(pageObjectId);
        contentObjectIds.push(contentObjectId);

        const  contentLines  =  [
            "BT",
            "/F1  10  Tf",
            "50  790  Td",
            "14  TL",
            ...pageLines.map((line)  =>  `(${escapePdfText(line)})  Tj  T*`),
            "ET"
        ].join("\n");

        objects[contentObjectId]  =  `<<  /Length  ${contentLines.length}  >>\nstream\n${contentLines}\nendstream`;
        objects[pageObjectId]  =
            `<<  /Type  /Page  /Parent  ${pagesRootId}  0  R  /MediaBox  [0  0  595  842]  `  +
            `/Resources  <<  /Font  <<  /F1  ${fontObjectId}  0  R  >>  >>  /Contents  ${contentObjectId}  0  R  >>`;
    }

    objects[1]  =  `<<  /Type  /Catalog  /Pages  ${pagesRootId}  0  R  >>`;
    objects[2]  =  `<<  /Type  /Pages  /Kids  [${pageObjectIds.map((id)  =>  `${id}  0  R`).join("  ")}]  /Count  ${pageObjectIds.length}  >>`;
    objects[3]  =  "<<  /Type  /Font  /Subtype  /Type1  /BaseFont  /Helvetica  >>";

    let  pdf  =  "%PDF-1.4\n";
    const  offsets:  number[]  =  [0];

    for  (let  objectId  =  1;  objectId  <  objects.length;  objectId  +=  1)  {
        const  body  =  objects[objectId];
        if  (!body)  {
            continue;
        }

        offsets[objectId]  =  pdf.length;
        pdf  +=  `${objectId}  0  obj\n${body}\nendobj\n`;
    }

    const  xrefOffset  =  pdf.length;
    pdf  +=  `xref\n0  ${objects.length}\n`;
    pdf  +=  "0000000000  65535  f  \n";

    for  (let  objectId  =  1;  objectId  <  objects.length;  objectId  +=  1)  {
        const  offset  =  offsets[objectId]  ??  0;
        pdf  +=  `${String(offset).padStart(10,  "0")}  00000  n  \n`;
    }

    pdf  +=
        `trailer\n<<  /Size  ${objects.length}  /Root  1  0  R  >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return  new  TextEncoder().encode(pdf);
}
