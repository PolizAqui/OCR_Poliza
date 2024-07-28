const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' }); 

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const textract = new AWS.Textract();

const controller = {};

controller.uploadArchive = async (req, res) => {
  try {
    // Cargar el archivo
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(500).send({ error: 'Error al cargar el archivo' });
      }

      // Leer el archivo
      const file = req.file;
      const fileContent = fs.readFileSync(file.path);

      const params = {
        Document: {
          Bytes: fileContent
        }
      };

      // Llamar a Textract
      textract.detectDocumentText(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          return res.status(500).send({ error: 'Error al procesar el documento' });
        } else {
          // Extract text from Textract response
          const text = data.Blocks.filter(block => block.BlockType === 'LINE').map(line => line.Text).join(' ');
          console.log(text);
          return res.send({ text });
        }
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Error al procesar la solicitud' });
  }
};

module.exports = controller;
