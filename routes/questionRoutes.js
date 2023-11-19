const router = require("express").Router()
const questionController = require("../controller/questionController")


router.get("/getall",questionController.questions);
router.post("/add",questionController.addQuestion);
router.post("/addsingle",questionController.addSingleQuestion);
router.post("/paper",questionController.createQuestionPaper);


module.exports = router