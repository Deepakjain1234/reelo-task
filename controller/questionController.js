const models = require('../models/index')
const Sequelize = require("sequelize");

const question = models.questions;


module.exports.questions = (req, res) => {
    question.findAll()
        .then((data) => {
            return res.json(data)
        })
        .catch((err) => {
            return res.json(err)
        })
}

module.exports.addQuestion = (req, res) => {
    const all = req.body;
    const length = all.length;
    for (var i = 0; i < length; i++) {
        question.create(all[i])
            .then((data) => {
                console.log(i)
            })

    }
}
module.exports.addSingleQuestion = (req, res) => {
    question.create(req.body)
        .then((data) => {
            return res.json(data)
        })
        .catch((err) => {
            return res.json(err)
        })
}

function uniformMarksDistributor(total, easy, medium, hard) {
    let easyQuestion = 0, mediumQuestion = 0, hardQuestion = 0;
    if (hard % 15 == 0) {
        hardQuestion = hard / 15;
        if (medium % 10 == 0) {
            mediumQuestion = medium / 10;
            let remain = total - (hardQuestion * 15 + mediumQuestion * 10);
            easyQuestion = parseInt(remain / 5);
        }
        else {
            easyQuestion = easy / 5;
            let remain = total - (hardQuestion * 15 + easyQuestion * 5);
            mediumQuestion = parseInt(remain / 5);
        }


    }
    else if (medium % 10 == 0) {
        mediumQuestion = medium / 10;
        if (hard % 15 == 0) {
            hardQuestion = hard / 15;
            let remain = total - (hardQuestion * 15 + mediumQuestion * 10);
            easyQuestion = parseInt(remain / 5);
        }
        else {
            easyQuestion = easy / 5;
            let remain = total - (mediumQuestion * 10 + easyQuestion * 5);
            hardQuestion = parseInt(remain / 5);
        }

    }
    else {
        easyQuestion = parseInt(easy / 5);
        if (hard % 15 == 0) {
            hardQuestion = hard / 15;
            let remain = total - (hardQuestion * 15 + easyQuestion * 5);
            mediumQuestion = parseInt(remain / 10);
        }
        else {
            mediumQuestion = parseInt(medium / 10);
            let remain = total - (mediumQuestion * 10 + easyQuestion * 5);
            hardQuestion = parseInt(remain / 5);
        }


    }
    return [easyQuestion, mediumQuestion, hardQuestion];
}
// marks divider
function subjectWiseQuestion(uniform) {
    let easy = uniform[0], medium = uniform[1], hard = uniform[2];
    let physics, chemistry, math;
    physics = [parseInt(easy / 3), parseInt(medium / 3), parseInt(hard / 3)];
    chemistry = [parseInt((easy) / 3), parseInt((medium) / 3), parseInt((hard) / 3)]
    math = [uniform[0] - (physics[0] + chemistry[0]), uniform[1] - (physics[1] + chemistry[1]), uniform[2] - (physics[2] + chemistry[2])]

    return [physics, chemistry, math]

}
// question find function 
async function findQuestion(subject, number) {

    const easy = await question.findAll(
        {
            where: {
                subject: subject,
                level: "Easy"
            },
            raw: true,
            order: [
                [Sequelize.literal('RAND()')]
            ],
            limit: number[0],

        }
    )
    const medium = await question.findAll(
        {
            where: {
                subject: subject,
                level: "Medium"
            },
            raw: true,
            order: [
                [Sequelize.literal('RAND()')]
            ],
            limit: number[1],

        }
    )
    const hard = await question.findAll(
        {
            where: {
                subject: subject,
                level: "Hard"
            },
            raw: true,
            order: [
                [Sequelize.literal('RAND()')]
            ],
            limit: number[2],

        }
    )
    return [easy, medium, hard]


}
 
// topic find function 
function topTopics(question) {
    var myMap = {};
    var number=0;
    for (let i = 0; i < question.length; i++) {
        number=number+question[i].length;
        for (let j = 0; j < question[i].length; j++) {
            myMap[question[i][j].topic] = (myMap[question[i][j].topic] || 0) + 1;
        }
    }
    for(var topic in myMap)
    {
      myMap[topic]=((myMap[topic]/number)*100).toFixed(2) +"%";
    }
    return myMap;

}

module.exports.createQuestionPaper = async (req, res) => {
    // Error handle 

    if(req.body.marks<100)
    {
        return res.json({
            error:"marks should we more than or equal to 100"
        })
    }
    else if (req.body.easy +req.body.medium +req.body.hard != 100)
    {
        return res.json({
            error:"marks percentage of all the subject should equal to 100"
        })
    }
    // percentage calculate 
    const easyPercentage = req.body.easy / 100;
    const mediumPercentage = req.body.medium / 100;
    const hardPercentage = req.body.hard / 100;
    // marks calculate 
    const easyMarks = (req.body.marks * easyPercentage);
    const mediumMarks = (req.body.marks * mediumPercentage);
    const hardMarks = (req.body.marks * hardPercentage);
    //    distibute marks
    let uniformquestion = uniformMarksDistributor(req.body.marks, easyMarks, mediumMarks, hardMarks)
    let subjestwise = subjectWiseQuestion(uniformquestion)
    // Find topicwise question  
    let physicsQuestion = await findQuestion("Physics", subjestwise[0])
    let chemistryQuestion = await findQuestion("Chemistry", subjestwise[1])
    let mathematicsQuestion = await findQuestion("Mathematics", subjestwise[2])
    // find topicwise marks 
    let totalMarks = uniformquestion[0] * 5 + uniformquestion[1] * 10 + uniformquestion[2] * 15;
    let physicsMarks = subjestwise[0][0] * 5 + subjestwise[0][1] * 10 + subjestwise[0][2] * 15;
    let chemistryMarks = subjestwise[1][0] * 5 + subjestwise[1][1] * 10 + subjestwise[1][2] * 15;
    let mathematicsMarks = subjestwise[2][0] * 5 + subjestwise[2][1] * 10 + subjestwise[2][2] * 15;
    // find topic wise question 
    let physicsTopic = topTopics(physicsQuestion);
    let chemistryTopic = topTopics(chemistryQuestion);
    let mathematicsTopic = topTopics(mathematicsQuestion);

    // return the final result 

    return res.json({ 

        totalMarks: totalMarks,

        physicsMarks: physicsMarks,
        physics: physicsQuestion,
        physicsTopicWiseQuestions:physicsTopic,
  

        chemistryMarks: chemistryMarks,
        chemistry: chemistryQuestion,
        chemistryTopicWiseQuestions:chemistryTopic,


        mathematicsMarks: mathematicsMarks,
        mathematics: mathematicsQuestion,
        mathematicsTopicWiseQuestions:mathematicsTopic
     })

}
