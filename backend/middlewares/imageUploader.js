
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');


let s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
    secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
  },
  sslEnabled: false,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const multerOptions = () => {
  const storage = multerS3({
    s3: s3, // s3 instance
    bucket: process.env.YOUR_S3_BUCKET_NAME, // change it as per your project requirement
    acl: "public-read", // storage access type
    metadata: (req, file, cb) => {
        cb(null, {fieldname: file.fieldname})
    },
    key: (req, file, cb) => {
      if (file.fieldname === 'avatar') {
        cb(null, 'images/' + req.user._id + Date.now() + '--' + file.originalname);
      } else if (file.fieldname  === 'resume') {
        cb(null, 'pdf/' + req.user._id + Date.now() + '--' + file.originalname);
      } else {
        cb(new CustomError('Invalid file type', 400), false);
      }
    }
});


  const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'avatar' && file.mimetype.startsWith('image')) {
      cb(null, true);
    } else if (file.fieldname === 'resume' && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new CustomError('Invalid file type', 400), false);
    }
  };

  const upload = multer({ storage, fileFilter });
  return upload;
};



// const multerOptions = () => {
//   storage: multerS3({
//     s3: s3,
//     acl: 'public-read',
//     bucket: 'bucket-name',
//     key: function (req, file, cb) {
//         console.log(file);
//         cb(null, file.originalname); //use Date.now() for unique file keys
//     }
// })

//   const fileFilter = (req, file, cb) => {
//     console.log(file.mimetype)
//     if (file.fieldname === 'avatar' && file.mimetype.startsWith('image')) {
//       cb(null, true);
//     } else if (file.fieldname === 'resume' && file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new CustomError('Invalid file type', 400), false);
//     }
//   };

//   const upload = multer({ storage, fileFilter });
//   return upload;
// };



// Upload single image
const uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

// Upload single PDF
const uploadSinglePDF = (fieldName) => multerOptions().single(fieldName);

module.exports = { uploadSingleImage, uploadSinglePDF };





