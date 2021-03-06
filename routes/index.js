const router = require('express').Router();
const Img = require('../models/image');
const multer = require('multer');
const deepai = require('deepai'); 
const fs = require('fs');
deepai.setApiKey(process.env.KEY);

const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,'imgaes')
    },
    filename:(req,file,callback)=>{
        callback(null , file.fieldname + "_" + Date.now()+ "_"+file.originalname);
    }
});


const upload = multer({
    storage:storage,
    limits:10000000,
}).single('image');



// function for deleting the images from server

// const kenycleaner = (path)=>{
//     try {
//         fs.unlinkSync(path)
//          Img.deleteMany({})
       
//       } catch(err) {
//         console.error(err)
//       }
// }

router.get('/',async (req,res)=>{

    res.render('index.ejs',{

        img : req.session.result,
        err:req.session.error
    });

    req.session.data=null;
    req.session.result = null;
    req.session.error = null;
});

router.post('/',async (req,res)=>{
    upload(req,res,async ()=>{
        // console.log(req);


        if(req.file===undefined){
            req.session.error  = 'Please Select a image';
            return res.redirect('/');
        }

        req.session.error = null;

        let img = new Img();

        img.name = req.file.filename;

        // console.log(req.file.filename);

        await Img.create(img);

        req.session.data = req.file.filename;

        let result = await deepai.callStandardApi("colorizer",{

            image: fs.createReadStream(`./imgaes/${req.session.data}`)

        });
    
        // console.log(result.output_url)

        req.session.result = result.output_url;

        // kenycleaner(`./${req.file.path}`)

        res.redirect('/');
    })
});




module.exports = router;