const morgan = require('morgan')

const app = require('./src/app')
const PORT = 8000

app.use(morgan('dev'))
app.listen(PORT, () => {
    console.log(new Date())
    console.log(`Server runnning on http://localhost:${PORT}/`);
})