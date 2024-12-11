
const renderDrive = async (req, res) => {
    if (res.locals.user) {
        res.render('drive')
    }
    else {
        res.redirect('log-in')
    }
}

const upload = async (req, res) => {
    console.log(req.file, req.body)
    
}

export default { renderDrive, upload }