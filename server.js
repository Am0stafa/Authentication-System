const os = require('os')
//! this is a core module 
//? it is used so that instead of using hardcoding a path as there can be some problems with different operating systems with the '/' this problem is eliminated when using path
const path = require('path')

console.log(os.type())
//! to get the dictatory name
console.log(__dirname)
//! to get the file name
console.log(__filename)
//! by this we get exactly the same thing as using the above
console.log(path.dirname(__filename))
//! basename allow us to just pull the file name out inserted of having every thing included`
console.log(path.basename(__filename)) //? server.js
//! extname just give us the extension of the file
console.log(path.extname(__filename)) //? .js
//! to get each individual value into an object we use parse
console.log(path.parse(__filename)) //? {root,dir,base,ext,name}
//! to use path: path.join(__dirname,"folder","the file")