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
    const all =req.body;
    const length=all.length;
    for(var i=0;i<length;i++)
    {
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

function uniformMarksDistributor(total,easy,medium,hard)
{
    let easyQuestion=0,mediumQuestion=0,hardQuestion=0;
    if(hard%15==0)
    {
        hardQuestion=hard/15;
        if(medium%10==0)
        {
         mediumQuestion=medium/10;
         let remain= total- ( hardQuestion*15 + mediumQuestion*10);
         easyQuestion=parseInt(remain/5);
        }
        else
        {   easyQuestion=easy/5;
            let remain= total- ( hardQuestion*15 + easyQuestion*5);
            mediumQuestion=parseInt(remain/5);
        }
        

    }
    else if(medium%10==0)
    {
        mediumQuestion=medium/10;
        if(hard%15==0)
        {
         hardQuestion=hard/15;
         let remain= total- ( hardQuestion*15 + mediumQuestion*10);
         easyQuestion=parseInt(remain/5);
        }
        else
        {   easyQuestion=easy/5;
            let remain= total- ( mediumQuestion*10 + easyQuestion*5);
            hardQuestion=parseInt(remain/5);
        }

    }
    else
    {
        easyQuestion=parseInt(easy/5);
        if(hard%15==0)
        {
         hardQuestion=hard/15;
         let remain= total- ( hardQuestion*15 + easyQuestion*5);
         mediumQuestion=parseInt(remain/10);
        }
        else
        {   mediumQuestion=parseInt(medium/10);
            let remain= total- ( mediumQuestion*10 + easyQuestion*5);
            hardQuestion=parseInt(remain/5);
        }


    }
    return [easyQuestion,mediumQuestion,hardQuestion];
}

function subjectWiseQuestion(uniform)
{
//   console.log(uniform)
   let easy=uniform[0],medium=uniform[1],hard=uniform[2];
   let physics,chemistry,math;
   physics=[parseInt(easy/3),parseInt(medium/3),parseInt(hard/3)];
   chemistry=[parseInt((easy)/3),parseInt((medium)/3),parseInt((hard)/3)]
   math=[uniform[0]-(physics[0]+chemistry[0]),uniform[1]-(physics[1]+chemistry[1]),uniform[2]-(physics[2]+chemistry[2])]

   return [physics,chemistry,math]

}

function findset(subject,limit,level)
{
    question.findAll(
        {
            where:{
                subject:subject,
                level:level
            },
            raw:true,
            order: [
              [Sequelize.literal('RAND()')]
            ],
            limit: limit,
      
          }
    )
        .then((data) => {
            // console.log(data)
            return data
        })
        .catch((err) => {
            // return json(err)
        })

}

async function findQuestion(subject,number){
    // const questionEasy= await findset(subject,number[0],"Easy")
    // console.log(questionEasy)
   const easy=await question.findAll(
        {
            where:{
                subject:subject,
                level:"Easy"
            },
            raw:true,
            order: [
              [Sequelize.literal('RAND()')]
            ],
            limit: number[0],
      
          }
    )
    // console.log(easy)
    const medium=await question.findAll(
        {
            where:{
                subject:subject,
                level:"Medium"
            },
            raw:true,
            order: [
              [Sequelize.literal('RAND()')]
            ],
            limit: number[1],
      
          }
    )
    // console.log(medium)

    const hard=await question.findAll(
        {
            where:{
                subject:subject,
                level:"Hard"
            },
            raw:true,
            order: [
              [Sequelize.literal('RAND()')]
            ],
            limit: number[3],
      
          }
    )
    return [easy,medium,hard]
    

}

module.exports.createQuestionPaper= async(req,res)=>{
    const easyPercentage=req.body.easy/100;
    const mediumPercentage=req.body.medium/100;
    const hardPercentage=req.body.hard/100;
    const easyMarks=(req.body.marks*easyPercentage);
    const mediumMarks=(req.body.marks*mediumPercentage);
    const hardMarks=(req.body.marks*hardPercentage);

    let uniformquestion=uniformMarksDistributor(req.body.marks,easyMarks,mediumMarks,hardMarks)
    let subjestwise=subjectWiseQuestion(uniformquestion)
    console.log(subjestwise)
    let physicsQuestion= await findQuestion("Physics",subjestwise[0])
    let chemistryQuestion= await findQuestion("Chemistry",subjestwise[1])
    let mathematicsQuestion= await findQuestion("Mathematics",subjestwise[2])
    let totalMarks=uniformquestion[0]*5 + uniformquestion[1]*10 + uniformquestion[2]*15;
    let physicsMarks= subjestwise[0][0]*5 + subjestwise[0][1]*10 +subjestwise[0][2]*15;
    let chemistryMarks= subjestwise[1][0]*5 + subjestwise[1][1]*10 +subjestwise[1][2]*15;
    let mathematicsMarks= subjestwise[2][0]*5 + subjestwise[2][1]*10 +subjestwise[2][2]*15;
    return res.json({totalMarks:totalMarks,physicsMarks:physicsMarks,physics:physicsQuestion,chemistryMarks:chemistryMarks,chemistry:chemistryQuestion, mathematicsMarks:mathematicsMarks,mathematics:mathematicsQuestion})

}
