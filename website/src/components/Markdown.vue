 <script>
 import MarkdownIt from 'markdown-it'
 const md = MarkdownIt()
 export default {
     markdown (markDownOptions) {
         var markdown = ""
         console.log(`option 1: ${markDownOptions[0]}`);
         console.log(` marked: ${md.render(markDownOptions[0])}`);
         markdown = md.render(markDownOptions[0]);
         for (let i = 1; i < markDownOptions.length; i++) {
             markdown += "\n \n" + md.render(markDownOptions[i])
         }
         console.log(markdown);
         return markdown;
     } 
 }
 </script>
 