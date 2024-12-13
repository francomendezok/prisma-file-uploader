
const renderDrive = async (req, res) => {
    if (res.locals.user) {
        res.render('drive', { files: [] })
    }
    else {
        res.redirect('log-in')
    }
}

export default { renderDrive }