const renderDrive = async (req, res) => {
    if (res.locals.user) {
        console.log(res.locals.user);
    }
    res.render('drive')
}

export default { renderDrive }