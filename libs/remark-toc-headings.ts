import { slug } from "github-slugger";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

function remarkTocHeadings(options: any) {
    return (tree: any) => visit(tree, 'heading', (node, index, parent) => {
        const textContent = toString(node);
        options.exportRef.push({
            value: textContent,
            url: `#${slug(textContent)}`,
            depth: node.depth
        })
    });
}


export default remarkTocHeadings;