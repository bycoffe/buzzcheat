;(function() {
  var quiz,
      matches = {};
  // Use last quiz
  for (k in bf_quiz.quizes) {
    quiz = bf_quiz.quizes[k];
  }
  function listOptions() {
    var options = [];
    for (k in quiz.results) {
      options.push(quiz.results[k].el.getAttribute("rel:name"));
    }
    return options;
  };
  function makeForm() {
    var div = document.createElement("div"),
        select = document.createElement("select"),
        clear = document.createElement("div")
        op = new Option();

    div.setAttribute("id", "buzzcheat");
    div.style.cssText = "z-index:9999;opacity:0.98;position:fixed;height:20px;background:#ccc;border-bottom:1px solid #aaa;width:100%;padding:6px 6px 10px 6px;";

    clear.innerHTML = "Reload";
    clear.style.cssText = "float:right;width:100px;text-align:center;cursor:pointer;margin-right:20px;background:#fff;border:1px solid gray;padding:4px 3px;";

    op.text = "Select a result";
    select.options.add(op);

    listOptions().forEach(function(d, i) {
      var op = new Option();
      op.value = i;
      op.text = d;
      select.options.add(op);
    });
    div.appendChild(select);
    div.appendChild(clear);
    select.onchange = answerQuiz;
    clear.onclick = function() {
      window.location.href = window.location.href;
    };
    return div;
  };
  function showForm() {
    document.body.insertBefore(makeForm(), document.body.firstChild)
  };
  // Given a selected personality index and an array
  // of answers, find the answer we want to select.
  function getAnswer(selection, answers) {
    var answersWithIndexes,
        match;
    // Create an array where each item is 
    // [rel:personality_index, answer]
    answersWithIndexes = answers.map(function(answer, i) {
      return [parseInt(answer.getAttribute("rel:personality_index")), answer]
    });
    // It's not very efficient to loop through each set
    // of answers multiple times, but there aren't usually
    // very many answers.

    // First look for an answer that matches the
    // user-selected personality index.
    match = answersWithIndexes.filter(function(d, i) {
      return d[0] == selection;
    });
    if (match.length > 0) {
      return match[0];
    }

    // If none exists, we look for an answer with a lower
    // personality index.
    match = answersWithIndexes.filter(function(d, i) {
      return d[0] < selection;
    });
    if (match.length > 0) {
      return match[0]
    }

    // If a lower one doesn't exist, we find the
    // next-highest one that we haven't already
    // chosen for a previous answer.
    answersWithIndexes.sort(function(a, b) {
      return a[0] - b[0];
    });
    match = answersWithIndexes.filter(function(d, i) {
      return d[0] > selection && typeof matches[d[0]] === "undefined";
    });
    if (match.length > 0) {
      return match[0];
    }

    // If we still don't have a match, something's wrong,
    // but just return the first answer.
    return answersWithIndexes[0];
  };
  function answerQuiz() {
    var select = document.getElementById("buzzcheat").getElementsByTagName("select")[0],
        options = select.options,
        idx = select.selectedIndex,
        selection = options[idx].getAttribute("value");
    // Remove previous answer, if one exists
    for (k in quiz.results) {
      quiz.results[k].el.style.cssText = "display:none";
    }
    // Loop through all the questions
    var answers,
        question,
        match;
    for (k in quiz.questions) {
      question = quiz.questions[k];
      match = getAnswer(selection, question.answers);
      if (!matches[match[0]]) {
        matches[match[0]] = 0;
      }
      matches[match[0]]++;
      // Set the correct class on each answer.
      question.answers.forEach(function(answer) {
        $(answer).removeClassName("selected");
        $(answer).removeClassName("deactivated");
        $(answer).addClassName(answer === match[1] ? "selected" : "deactivated");
      });
      question.personality_index = match[0];
      question.response = match[1];
    }
    quiz.completed = true;
    bf_quiz.show_results(quiz);
    $(quiz.el)[bfjs.selector](".answer_shares .answer_shares_buttons a").forEach(function(d,i) { d.remove(); });
    bf_quiz.quiz_shares(quiz);
  };
  showForm();
}());
