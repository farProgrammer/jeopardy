// javascript file


 //categories is the main data structure for the app; it looks like this:
  // [    { title: "Math",
  //     clues: [
  //      {question: "2+2", answer: 4, showing: null},
  //      {question: "1+1", answer: 2, showing: null},
  //        ...clues
  //     ],
  //  },
  //    { title: "Literature",
  //    clues: [
  //        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
  //        {question: "Bell Jar Author", answer: "Plath", showing: null},
  //        ... clues
  //    ],
  //   },
  //   ...clues
  //  ]

  let categories = [];
  const BASE_API_URL = "https://jservice.io/api/";
  const NUM_CATEGORIES = 5;
  const NUM_CLUES_PER_kato = 5;
  
  
  /** Get NUM_CATEGORIES random category from API.
   *
   * Returns array of category ids
   */
  
  async function getCategoryIds() {
    // ask for 100 categories [most we can ask for], so we can pick random
    let res = await axios.get(`${BASE_API_URL}categories?count=100`);
    let katoIds = res.data.map(k => k.id);
    return _.sampleSize(katoIds, NUM_CATEGORIES);
  }
  
  /** Return object with data about a category:
   *
   *  Returns { title: "Math", clues: clue-array }
   *
   * Where clue-array is:
   *   [
   *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
   *      {question: "Bell Jar Author", answer: "Plath", showing: null},
   *      ...
   *   ]
   */
  
  async function getCategory(katoId) {
    let res = await axios.get(`${BASE_API_URL}category?id=${katoId}`);
    let kato = res.data;
    let allClues = kato.clues;
    let randomClues = _.sampleSize(allClues, NUM_CLUES_PER_kato);
    let clues = randomClues.map(k => ({
      question: k.question,
      answer: k.answer,
      showing: null,
    }));
  
    return { title: kato.title, clues };
  }
  
  /** Fill the HTML table#jeopardy with the categories & cells for questions.
   *
   * - The <thead> should be filled w/a <tr>, and a <td> for each category
   * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
   *   each with a question for each category in a <td>
   *   (initally, just show a "?" where the question/answer would go.)
   */
  
  async function fillTable() {
    // Add row with headers for categories
    $("#jeopardy thead").empty();
    let $tr = $("<tr>");
    for (let katoIdx = 0; katoIdx < NUM_CATEGORIES; katoIdx++) {
      $tr.append($("<th>").text(categories[katoIdx].title));
    }
    $("#jeopardy thead").append($tr);
  
    // Add rows with questions for each category
    $("#jeopardy tbody").empty();
    for (let clueIdx = 0; clueIdx < NUM_CLUES_PER_kato; clueIdx++) {
      let $tr = $("<tr>");
      for (let katoIdx = 0; katoIdx < NUM_CATEGORIES; katoIdx++) {
        $tr.append($("<td>").attr("id", `${katoIdx}-${clueIdx}`).text("?"));
      }
      $("#jeopardy tbody").append($tr);
    }
  }
  
  /** Handle clicking on a clue: show the question or answer.
   *
   * Uses .showing property on clue to determine what to show:
   * - if currently null, show question & set .showing to "question"
   * - if currently "question", show answer & set .showing to "answer"
   * - if currently "answer", ignore click
   * */
  
  function handleClick(evt) {
    let id = evt.target.id;
    let [katoId, clueId] = id.split("-");
    let clue = categories[katoId].clues[clueId];
  
    let msg;
  
    if (!clue.showing) {
      msg = clue.question;
      clue.showing = "question";
    } else if (clue.showing === "question") {
      msg = clue.answer;
      clue.showing = "answer";
    } else {
      // already showing answer; ignore
      return
    }
  
    // Update text of cell
    $(`#${katoId}-${clueId}`).html(msg);
  }
  
  /** Start game:
   *
   * - get random category Ids
   * - get data for each category
   * - create HTML table
   * */
  
  async function setupAndStart() {
    let katoIds = await getCategoryIds();
  
    categories = [];
  
    for (let katoId of katoIds) {
      categories.push(await getCategory(katoId));
    }
  
    fillTable();
  }
  
  /** On click of restart button, restart game. */
  
  $("#restart").on("click", setupAndStart);
  
  /** On page load, setup and start & add event handler for clicking clues */
  
  $(async function () {
      setupAndStart();
      $("#jeopardy").on("click", "td", handleClick);
    }
  );
  