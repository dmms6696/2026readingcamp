(function () {
  "use strict";

  const SAVE_KEY = "yulStoryGame.save.v1";
  const MIN_VALUE = 0;
  const MAX_VALUE = 100;

  const stateTemplate = {
    playerName: "",
    currentEventId: "",
    stats: {},
    relations: {},
    flags: [],
    history: [],
    lastResult: "",
    ended: false,
    endingId: null
  };

  let state = null;

  const els = {
    startScreen: document.getElementById("startScreen"),
    gameScreen: document.getElementById("gameScreen"),
    startForm: document.getElementById("startForm"),
    playerNameInput: document.getElementById("playerName"),
    startMessage: document.getElementById("startMessage"),
    continueButton: document.getElementById("continueButton"),
    openGuideButton: document.getElementById("openGuideButton"),
    closeGuideButton: document.getElementById("closeGuideButton"),
    guideDialog: document.getElementById("guideDialog"),
    sceneImage: document.getElementById("sceneImage"),
    eventPhase: document.getElementById("eventPhase"),
    eventType: document.getElementById("eventType"),
    eventTitle: document.getElementById("eventTitle"),
    eventText: document.getElementById("eventText"),
    dialogueBox: document.getElementById("dialogueBox"),
    speakerName: document.getElementById("speakerName"),
    dialogueText: document.getElementById("dialogueText"),
    resultMessage: document.getElementById("resultMessage"),
    choiceList: document.getElementById("choiceList"),
    progressHint: document.getElementById("progressHint"),
    statusPlayerName: document.getElementById("statusPlayerName"),
    statusPhase: document.getElementById("statusPhase"),
    statsList: document.getElementById("statsList"),
    relationsList: document.getElementById("relationsList"),
    flagsList: document.getElementById("flagsList"),
    historyList: document.getElementById("historyList"),
    restartButton: document.getElementById("restartButton")
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    document.title = GAME_DATA.meta.title;
    bindEvents();
    updateContinueButton();
  }

  function bindEvents() {
    els.startForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = els.playerNameInput.value.trim();

      if (!name) {
        els.startMessage.textContent = "플레이어 이름을 입력해 주세요.";
        els.playerNameInput.focus();
        return;
      }

      startNewGame(name);
    });

    els.continueButton.addEventListener("click", function () {
      const saved = loadGame();
      if (!saved) {
        updateContinueButton();
        return;
      }

      state = saved;
      showGame();
      renderCurrent();
    });

    els.restartButton.addEventListener("click", function () {
      restartGame();
    });

    els.openGuideButton.addEventListener("click", function () {
      if (typeof els.guideDialog.showModal === "function") {
        els.guideDialog.showModal();
      } else {
        alert("선택에 따라 스탯, 관계, 플래그, 이벤트와 엔딩이 달라지는 이야기 게임입니다.");
      }
    });

    els.closeGuideButton.addEventListener("click", function () {
      els.guideDialog.close();
    });

    els.sceneImage.addEventListener("error", function () {
      if (els.sceneImage.dataset.fallbackApplied === "true") {
        return;
      }

      els.sceneImage.dataset.fallbackApplied = "true";
      els.sceneImage.src = GAME_DATA.meta.defaultImage || "assets/classroom.svg";
    });
  }

  function startNewGame(name) {
    state = createInitialState(name);
    els.startMessage.textContent = "";
    saveGame();
    showGame();
    renderCurrent();
  }

  function createInitialState(name) {
    const nextState = structuredCloneSafe(stateTemplate);
    nextState.playerName = name;
    nextState.currentEventId = GAME_DATA.meta.startEventId;

    GAME_DATA.stats.forEach(function (stat) {
      nextState.stats[stat.id] = clamp(stat.initial);
    });

    GAME_DATA.characters.forEach(function (character) {
      nextState.relations[character.id] = {};
      GAME_DATA.relationStats.forEach(function (relationStat) {
        const value = character.relations[relationStat.id] || 0;
        nextState.relations[character.id][relationStat.id] = clamp(value);
      });
    });

    return nextState;
  }

  function showGame() {
    els.startScreen.classList.add("is-hidden");
    els.gameScreen.classList.remove("is-hidden");
  }

  function showStart() {
    els.gameScreen.classList.add("is-hidden");
    els.startScreen.classList.remove("is-hidden");
    updateContinueButton();
  }

  function renderCurrent() {
    ensureStateShape();

    if (state.ended && state.endingId) {
      renderEnding(getEndingById(state.endingId) || getDefaultEnding());
      return;
    }

    let event = getEventById(state.currentEventId);

    if (!event) {
      state.currentEventId = GAME_DATA.meta.startEventId;
      state.lastResult = "잘못된 장면 정보가 있어 처음 장면으로 돌아왔습니다.";
      event = getEventById(state.currentEventId);
    }

    if (event.type === "ending_check") {
      renderEnding(determineEnding());
      return;
    }

    if (!meetsRequired(event.required)) {
      const fallbackId = event.fallbackEventId || GAME_DATA.meta.fallbackEventId || GAME_DATA.meta.endingCheckEventId;
      state.currentEventId = fallbackId;
      state.lastResult = "조건이 맞지 않아 다른 장면으로 이어졌습니다.";
      saveGame();
      renderCurrent();
      return;
    }

    renderEvent(event);
    renderStatus(event.phase);
    saveGame();
  }

  function renderEvent(event) {
    setSceneImage(event.image);
    els.eventPhase.textContent = event.phase || "진행";
    els.eventType.textContent = getTypeLabel(event.type);
    els.eventTitle.textContent = event.title || "이름 없는 장면";
    els.eventText.textContent = event.text || "장면 설명이 아직 입력되지 않았습니다.";

    if (event.dialogue || event.speaker) {
      els.dialogueBox.classList.remove("is-empty");
      els.speakerName.textContent = event.speaker || "서술";
      els.dialogueText.textContent = event.dialogue || "";
    } else {
      els.dialogueBox.classList.add("is-empty");
      els.speakerName.textContent = "";
      els.dialogueText.textContent = "";
    }

    els.resultMessage.textContent = state.lastResult || "";
    els.choiceList.innerHTML = "";

    const choices = Array.isArray(event.choices) ? event.choices : [];
    if (choices.length === 0) {
      const fallbackButton = document.createElement("button");
      fallbackButton.type = "button";
      fallbackButton.className = "choice-button";
      fallbackButton.textContent = "다음으로";
      fallbackButton.addEventListener("click", function () {
        moveToEvent(GAME_DATA.meta.endingCheckEventId);
      });
      els.choiceList.appendChild(fallbackButton);
      els.progressHint.textContent = "선택지가 없어 기본 진행으로 이어집니다.";
      return;
    }

    choices.forEach(function (choice) {
      const canChoose = meetsRequired(choice.required);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice-button";
      button.disabled = !canChoose;

      const label = document.createElement("span");
      label.textContent = choice.text || "이름 없는 선택지";
      button.appendChild(label);

      if (!canChoose) {
        const condition = document.createElement("span");
        condition.className = "choice-condition";
        condition.textContent = "조건 필요: " + describeRequired(choice.required);
        button.appendChild(condition);
      }

      button.addEventListener("click", function () {
        handleChoice(event, choice);
      });

      els.choiceList.appendChild(button);
    });

    els.progressHint.textContent = "선택지를 누르면 결과가 저장되고 다음 장면으로 이동합니다.";
  }

  function handleChoice(event, choice) {
    if (!meetsRequired(choice.required)) {
      state.lastResult = "아직 이 선택을 하기 위한 조건이 부족합니다.";
      renderCurrent();
      return;
    }

    applyEffects(choice.effects || {});
    addHistory(event, choice);
    state.lastResult = choice.resultText || "선택 결과가 적용되었습니다.";

    const nextEventId = choice.nextEventId || event.nextEventId || GAME_DATA.meta.endingCheckEventId;
    moveToEvent(nextEventId);
  }

  function moveToEvent(nextEventId) {
    const nextEvent = getEventById(nextEventId);

    if (!nextEvent) {
      state.currentEventId = GAME_DATA.meta.endingCheckEventId;
      state.lastResult = state.lastResult || "다음 장면 정보가 없어 엔딩으로 이동합니다.";
      saveGame();
      renderCurrent();
      return;
    }

    if (!meetsRequired(nextEvent.required)) {
      state.currentEventId = nextEvent.fallbackEventId || GAME_DATA.meta.fallbackEventId || GAME_DATA.meta.endingCheckEventId;
      state.lastResult = "조건이 맞지 않아 다른 장면으로 이어졌습니다.";
    } else {
      state.currentEventId = nextEventId;
    }

    saveGame();
    renderCurrent();
  }

  function applyEffects(effects) {
    if (effects.stats) {
      Object.keys(effects.stats).forEach(function (statId) {
        const current = state.stats[statId] || 0;
        state.stats[statId] = clamp(current + Number(effects.stats[statId] || 0));
      });
    }

    if (effects.relations) {
      Object.keys(effects.relations).forEach(function (characterId) {
        if (!state.relations[characterId]) {
          state.relations[characterId] = {};
        }

        Object.keys(effects.relations[characterId]).forEach(function (relationId) {
          const current = state.relations[characterId][relationId] || 0;
          const change = Number(effects.relations[characterId][relationId] || 0);
          state.relations[characterId][relationId] = clamp(current + change);
        });
      });
    }

    if (Array.isArray(effects.flags)) {
      effects.flags.forEach(function (flag) {
        if (flag && !state.flags.includes(flag)) {
          state.flags.push(flag);
        }
      });
    }
  }

  function addHistory(event, choice) {
    const entry = {
      eventTitle: event.title || "이름 없는 장면",
      choiceText: choice.text || "이름 없는 선택",
      resultText: choice.resultText || "",
      at: new Date().toISOString()
    };

    state.history.push(entry);
    state.history = state.history.slice(-20);
  }

  function renderStatus(phase) {
    els.statusPlayerName.textContent = state.playerName || "-";
    els.statusPhase.textContent = phase || "진행";

    renderStats();
    renderRelations();
    renderFlags();
    renderHistory();
  }

  function renderStats() {
    els.statsList.innerHTML = "";

    GAME_DATA.stats.forEach(function (stat) {
      const value = clamp(state.stats[stat.id] || 0);
      els.statsList.appendChild(createMeter(stat.label, value, stat.tone, stat.description));
    });
  }

  function renderRelations() {
    els.relationsList.innerHTML = "";

    GAME_DATA.characters.forEach(function (character) {
      const group = document.createElement("div");
      group.className = "relation-card";

      const title = document.createElement("h4");
      title.textContent = character.name;
      group.appendChild(title);

      const meters = document.createElement("div");
      meters.className = "relation-meters";

      GAME_DATA.relationStats.forEach(function (relationStat) {
        const value = clamp((state.relations[character.id] || {})[relationStat.id] || 0);
        meters.appendChild(createMeter(relationStat.label, value, relationStat.tone));
      });

      group.appendChild(meters);
      els.relationsList.appendChild(group);
    });
  }

  function createMeter(label, value, tone, titleText) {
    const row = document.createElement("div");
    row.className = "meter-row";
    if (titleText) {
      row.title = titleText;
    }

    const top = document.createElement("div");
    top.className = "meter-top";

    const labelEl = document.createElement("strong");
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.textContent = value + " / 100";

    top.append(labelEl, valueEl);

    const track = document.createElement("div");
    track.className = "meter-track";

    const fill = document.createElement("div");
    fill.className = "meter-fill tone-" + (tone || "teal");
    fill.style.width = value + "%";

    track.appendChild(fill);
    row.append(top, track);
    return row;
  }

  function renderFlags() {
    els.flagsList.innerHTML = "";

    if (!state.flags.length) {
      const empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = "아직 획득한 플래그가 없습니다.";
      els.flagsList.appendChild(empty);
      return;
    }

    state.flags.forEach(function (flag) {
      const chip = document.createElement("span");
      chip.className = "flag-chip";
      chip.textContent = GAME_DATA.flagLabels[flag] || flag;
      els.flagsList.appendChild(chip);
    });
  }

  function renderHistory() {
    els.historyList.innerHTML = "";

    const recent = state.history.slice(-5).reverse();
    if (!recent.length) {
      const item = document.createElement("li");
      item.textContent = "아직 선택 기록이 없습니다.";
      els.historyList.appendChild(item);
      return;
    }

    recent.forEach(function (entry) {
      const item = document.createElement("li");
      item.textContent = entry.choiceText;
      els.historyList.appendChild(item);
    });
  }

  function renderEnding(ending) {
    const safeEnding = ending || getDefaultEnding();
    state.ended = true;
    state.endingId = safeEnding.id;
    saveGame();

    setSceneImage(safeEnding.image || GAME_DATA.meta.defaultImage);
    els.eventPhase.textContent = "엔딩";
    els.eventType.textContent = safeEnding.type || "엔딩";
    els.eventTitle.textContent = safeEnding.title || "기본 엔딩";
    els.eventText.textContent = safeEnding.text || "조건에 맞는 엔딩 설명이 없습니다.";
    els.dialogueBox.classList.remove("is-empty");
    els.speakerName.textContent = "오늘의 기록";
    els.dialogueText.textContent = "당신의 선택은 \"" + els.eventTitle.textContent + "\" 엔딩으로 이어졌습니다.";
    els.resultMessage.textContent = state.lastResult || "";
    els.choiceList.innerHTML = "";

    const restart = document.createElement("button");
    restart.type = "button";
    restart.className = "choice-button";
    restart.textContent = "처음부터 다시 시작";
    restart.addEventListener("click", restartGame);
    els.choiceList.appendChild(restart);

    els.progressHint.textContent = "엔딩에 도달했습니다. 저장된 기록으로 이어보거나 처음부터 다시 시작할 수 있습니다.";
    renderStatus("엔딩");
  }

  function determineEnding() {
    let defaultEnding = null;

    for (const ending of GAME_DATA.endings) {
      if (ending.default) {
        defaultEnding = ending;
        continue;
      }

      if (meetsRequired(ending.condition)) {
        return ending;
      }
    }

    return defaultEnding || GAME_DATA.endings[0] || {
      id: "fallback_ending",
      title: "기본 엔딩",
      type: "기본",
      text: "조건에 맞는 엔딩이 없어 기본 엔딩으로 이동했습니다.",
      image: GAME_DATA.meta.defaultImage
    };
  }

  function meetsRequired(required) {
    if (!required) {
      return true;
    }

    if (required.stats) {
      for (const statId of Object.keys(required.stats)) {
        if ((state.stats[statId] || 0) < Number(required.stats[statId])) {
          return false;
        }
      }
    }

    if (required.statsMax) {
      for (const statId of Object.keys(required.statsMax)) {
        if ((state.stats[statId] || 0) > Number(required.statsMax[statId])) {
          return false;
        }
      }
    }

    if (required.relations) {
      for (const characterId of Object.keys(required.relations)) {
        const relationRules = required.relations[characterId];
        for (const rawKey of Object.keys(relationRules)) {
          const expected = Number(relationRules[rawKey]);
          const isMaxRule = rawKey.endsWith("Max");
          const isMinRule = rawKey.endsWith("Min");
          const relationId = rawKey.replace(/Max$|Min$/u, "");
          const actual = ((state.relations[characterId] || {})[relationId] || 0);

          if (isMaxRule && actual > expected) {
            return false;
          }

          if ((isMinRule || !isMaxRule) && actual < expected) {
            return false;
          }
        }
      }
    }

    if (Array.isArray(required.flags) && required.flags.some(function (flag) {
      return !state.flags.includes(flag);
    })) {
      return false;
    }

    if (Array.isArray(required.anyFlags) && required.anyFlags.length > 0) {
      return required.anyFlags.some(function (flag) {
        return state.flags.includes(flag);
      });
    }

    return true;
  }

  function describeRequired(required) {
    if (!required) {
      return "없음";
    }

    const parts = [];

    if (required.stats) {
      Object.keys(required.stats).forEach(function (statId) {
        const stat = GAME_DATA.stats.find(function (item) {
          return item.id === statId;
        });
        parts.push((stat ? stat.label : statId) + " " + required.stats[statId] + " 이상");
      });
    }

    if (required.relations) {
      Object.keys(required.relations).forEach(function (characterId) {
        const character = GAME_DATA.characters.find(function (item) {
          return item.id === characterId;
        });
        const characterName = character ? character.name : characterId;
        Object.keys(required.relations[characterId]).forEach(function (rawKey) {
          const value = required.relations[characterId][rawKey];
          const isMaxRule = rawKey.endsWith("Max");
          const relationId = rawKey.replace(/Max$|Min$/u, "");
          const relation = GAME_DATA.relationStats.find(function (item) {
            return item.id === relationId;
          });
          const relationName = relation ? relation.label : relationId;
          parts.push(characterName + " " + relationName + " " + value + (isMaxRule ? " 이하" : " 이상"));
        });
      });
    }

    if (required.flags) {
      required.flags.forEach(function (flag) {
        parts.push((GAME_DATA.flagLabels[flag] || flag) + " 보유");
      });
    }

    if (required.anyFlags) {
      parts.push("관련 플래그 중 하나 보유");
    }

    return parts.join(", ") || "조건 없음";
  }

  function ensureStateShape() {
    if (!state) {
      state = createInitialState("플레이어");
    }

    state.stats = state.stats || {};
    state.relations = state.relations || {};
    state.flags = Array.isArray(state.flags) ? state.flags : [];
    state.history = Array.isArray(state.history) ? state.history : [];

    GAME_DATA.stats.forEach(function (stat) {
      if (typeof state.stats[stat.id] !== "number") {
        state.stats[stat.id] = clamp(stat.initial);
      } else {
        state.stats[stat.id] = clamp(state.stats[stat.id]);
      }
    });

    GAME_DATA.characters.forEach(function (character) {
      if (!state.relations[character.id]) {
        state.relations[character.id] = {};
      }

      GAME_DATA.relationStats.forEach(function (relationStat) {
        if (typeof state.relations[character.id][relationStat.id] !== "number") {
          state.relations[character.id][relationStat.id] = clamp(character.relations[relationStat.id] || 0);
        } else {
          state.relations[character.id][relationStat.id] = clamp(state.relations[character.id][relationStat.id]);
        }
      });
    });
  }

  function setSceneImage(src) {
    els.sceneImage.dataset.fallbackApplied = "false";
    els.sceneImage.src = src || GAME_DATA.meta.defaultImage || "assets/classroom.svg";
  }

  function getEventById(id) {
    return GAME_DATA.events.find(function (event) {
      return event.id === id;
    }) || null;
  }

  function getEndingById(id) {
    return GAME_DATA.endings.find(function (ending) {
      return ending.id === id;
    }) || null;
  }

  function getDefaultEnding() {
    return GAME_DATA.endings.find(function (ending) {
      return ending.default;
    }) || GAME_DATA.endings[0] || null;
  }

  function getTypeLabel(type) {
    const labels = {
      canon_observation: "관찰",
      hidden_event: "조건부 장면",
      dialogue: "대화",
      ending_check: "엔딩 판정"
    };

    return labels[type] || "장면";
  }

  function clamp(value) {
    const number = Number(value);
    if (Number.isNaN(number)) {
      return MIN_VALUE;
    }
    return Math.min(MAX_VALUE, Math.max(MIN_VALUE, number));
  }

  function saveGame() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      updateContinueButton();
    } catch (error) {
      console.warn("게임 저장에 실패했습니다.", error);
    }
  }

  function loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || !parsed.playerName) {
        localStorage.removeItem(SAVE_KEY);
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn("저장 데이터를 읽을 수 없습니다.", error);
      localStorage.removeItem(SAVE_KEY);
      return null;
    }
  }

  function updateContinueButton() {
    const hasSave = Boolean(loadGame());
    els.continueButton.classList.toggle("is-hidden", !hasSave);
  }

  function restartGame() {
    const ok = confirm("저장된 진행을 지우고 처음부터 다시 시작할까요?");
    if (!ok) {
      return;
    }

    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      console.warn("저장 데이터 삭제에 실패했습니다.", error);
    }

    state = null;
    els.playerNameInput.value = "";
    els.startMessage.textContent = "";
    showStart();
  }

  function structuredCloneSafe(value) {
    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
  }
})();
