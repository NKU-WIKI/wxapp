const md = require('./parse/markdown/index'),
    parse = require('./parse/index')

// module.exports = (str,type,option)=>{
//     option = option || {};
//     let result;
//     switch (type) {
//         case 'markdown':
//             result = parse(md(str),option);
//         break;
//         case 'html':
//             result = parse(str,option);
//         break;
//         default:
//             throw new Error('Invalid type, only markdown and html are supported');
//         break;
//     };
//     return result;
// };


module.exports = (str,type,option)=>{
    option = option || {};
    let result;
    switch (type) {
        case 'markdown':
            let r = md(str)
            // 修改换行处理逻辑
            r = r.replace(/(\r|\n){2,}/g, '\n'); // 多个连续换行替换为单个换行
            r = r.replace(/\r|\n/g, '<br/>'); // 单个换行替换为<br/>

            result = parse(r,option);
        break;
        case 'html':
            result = parse(str,option);
        break;
        default:
            throw new Error('Invalid type, only markdown and html are supported');
        break;
    };
    return result;
};