/*
  교사용 편집 안내

  1. 이벤트 추가 방법
     - GAME_DATA.events 배열에 새 객체를 추가합니다.
     - id는 겹치지 않게 만들고, 이전 선택지의 nextEventId에 그 id를 적습니다.

  2. 선택지 추가 방법
     - 이벤트 객체의 choices 배열에 선택지 객체를 추가합니다.
     - text는 버튼 문구, resultText는 선택 뒤 다음 장면에 표시될 결과 문구입니다.

  3. 스탯 변화 입력 방법
     - effects.stats에 sight, courage, care, sincerity 값을 적습니다.
     - 양수는 증가, 음수는 감소입니다. 값은 자동으로 0~100 사이로 제한됩니다.

  4. 관계 변화 입력 방법
     - effects.relations에 인물 id를 쓰고 closeness, trust, guard 값을 적습니다.
     - 예: yul: { closeness: 3, trust: 5, guard: -4 }

  5. 플래그 사용 방법
     - effects.flags 배열에 문자열을 넣으면 선택 뒤 플레이어가 그 플래그를 얻습니다.
     - 이벤트나 선택지의 required.flags에 같은 문자열을 넣으면 조건으로 사용할 수 있습니다.

  6. 엔딩 조건 작성 방법
     - endings 배열의 condition에 필요한 stats, relations, flags, anyFlags를 적습니다.
     - relations에서 guardMax처럼 Max로 끝나는 조건은 해당 값 이하일 때 통과합니다.
     - default: true인 엔딩은 다른 조건에 맞는 엔딩이 없을 때 사용됩니다.
*/

const GAME_DATA = {
  meta: {
    title: "율의 시선: 다시 바라보는 하루",
    description: "《율의 시선》의 분위기를 바탕으로 만든 중학교 독서캠프용 선택형 스토리 웹게임 프레임워크입니다.",
    startEventId: "intro_001",
    fallbackEventId: "distance_001",
    endingCheckEventId: "ending_check_001",
    defaultImage: "assets/classroom.svg"
  },
  stats: [
    {
      id: "sight",
      label: "시선 이해력",
      initial: 10,
      description: "표정, 분위기, 숨은 감정을 읽는 힘",
      tone: "teal"
    },
    {
      id: "courage",
      label: "관계 용기",
      initial: 10,
      description: "먼저 말을 걸고 다가가는 힘",
      tone: "rose"
    },
    {
      id: "care",
      label: "배려 감각",
      initial: 10,
      description: "상대의 속도와 감정을 존중하는 힘",
      tone: "leaf"
    },
    {
      id: "sincerity",
      label: "표현 진심도",
      initial: 10,
      description: "자신의 마음을 솔직하게 드러내는 힘",
      tone: "gold"
    }
  ],
  relationStats: [
    { id: "closeness", label: "친밀도", tone: "leaf" },
    { id: "trust", label: "신뢰도", tone: "teal" },
    { id: "guard", label: "경계도", tone: "rose" }
  ],
  characters: [
    {
      id: "yul",
      name: "안율",
      relations: { closeness: 10, trust: 10, guard: 70 }
    },
    {
      id: "dohae",
      name: "도해",
      relations: { closeness: 20, trust: 20, guard: 40 }
    },
    {
      id: "classmates",
      name: "반 친구들",
      relations: { closeness: 30, trust: 25, guard: 30 }
    }
  ],
  flagLabels: {
    observed_classroom: "교실을 살펴봄",
    dont_judge_yul_quickly: "성급히 판단하지 않음",
    quick_question_yul: "곧장 캐물음",
    refuse_rumor: "소문에 기대지 않음",
    followed_mood: "분위기에 휩쓸림",
    protect_distance: "거리를 지켜 줌",
    gentle_groupwork: "조별 활동에서 배려함",
    hurried_groupwork: "활동을 서두름",
    gentle_words: "조심스러운 말 건넴",
    pressured_yul: "대답을 재촉함",
    respected_distance: "오늘의 거리를 존중함",
    shared_quiet_moment: "조용한 순간을 나눔",
    quick_judgment: "성급한 해석을 말함"
  },
  events: [
    {
      id: "intro_001",
      type: "canon_observation",
      title: "낯선 교실의 첫 자리",
      phase: "도입",
      image: "assets/classroom.svg",
      text: "독서캠프 활동을 위해 들어온 교실은 조금 낯설고, 조금 조용하다. 칠판에는 오늘의 질문이 남아 있고, 창가 쪽 책상에는 아직 말이 닿지 않은 공기가 흐른다.",
      speaker: "",
      dialogue: "자리에 앉기 전, 당신은 교실의 분위기를 먼저 살핀다.",
      required: { stats: {}, relations: {}, flags: [] },
      choices: [
        {
          id: "intro_observe",
          text: "교실 분위기와 친구들의 표정을 천천히 살핀다.",
          resultText: "당신은 바로 끼어들지 않고 교실의 작은 움직임들을 지켜보았다.",
          effects: {
            stats: { sight: 3, courage: 0, care: 2, sincerity: 0 },
            relations: { classmates: { closeness: 0, trust: 2, guard: 0 } },
            flags: ["observed_classroom"]
          },
          nextEventId: "atmosphere_001"
        },
        {
          id: "intro_greet",
          text: "가까운 친구에게 먼저 인사하고 빈자리를 물어본다.",
          resultText: "당신의 인사는 어색한 공기를 조금 풀어 주었다.",
          effects: {
            stats: { sight: 0, courage: 3, care: 0, sincerity: 1 },
            relations: { classmates: { closeness: 2, trust: 1, guard: -1 } },
            flags: []
          },
          nextEventId: "atmosphere_001"
        }
      ]
    },
    {
      id: "atmosphere_001",
      type: "canon_observation",
      title: "안율을 둘러싼 조용한 결",
      phase: "도입",
      image: "assets/cloudy-classroom.svg",
      text: "활동지가 나뉘는 동안 몇몇 시선이 창가 쪽으로 향한다. 안율은 책상 위의 종이를 반듯하게 맞추고 있지만, 누군가 말을 걸 때마다 잠깐 멈칫한다.",
      speaker: "반 친구",
      dialogue: "쟤는 원래 좀 그래. 괜히 말 걸면 분위기 이상해질걸.",
      required: { stats: {}, relations: {}, flags: [] },
      choices: [
        {
          id: "atmosphere_wait",
          text: "바로 판단하지 않고 안율의 표정과 상황을 더 본다.",
          resultText: "당신은 들은 말보다 지금 보이는 표정과 분위기를 더 믿어 보기로 했다.",
          effects: {
            stats: { sight: 5, courage: 0, care: 3, sincerity: 0 },
            relations: { yul: { closeness: 0, trust: 2, guard: -5 } },
            flags: ["dont_judge_yul_quickly"]
          },
          nextEventId: "rumor_001"
        },
        {
          id: "atmosphere_ask",
          text: "무슨 일인지 바로 물어보며 분위기를 확인한다.",
          resultText: "질문은 빠르게 던져졌고, 몇몇 친구들은 당신을 바라보았다.",
          effects: {
            stats: { sight: -1, courage: 2, care: -1, sincerity: 1 },
            relations: {
              yul: { closeness: 0, trust: -1, guard: 8 },
              classmates: { closeness: 1, trust: 1, guard: 0 }
            },
            flags: ["quick_question_yul"]
          },
          nextEventId: "rumor_001"
        }
      ]
    },
    {
      id: "rumor_001",
      type: "dialogue",
      title: "복도에서 들은 말",
      phase: "중반",
      image: "assets/hallway.svg",
      text: "쉬는 시간이 되자 복도에는 낮은 목소리들이 섞인다. 누군가는 어제의 일을 말하고, 누군가는 안율의 태도를 이미 결론처럼 이야기한다.",
      speaker: "도해",
      dialogue: "네가 보기엔 어때? 다들 그렇게 말하니까 나도 잘 모르겠어.",
      required: { stats: {}, relations: {}, flags: [] },
      choices: [
        {
          id: "rumor_direct",
          text: "직접 보거나 들은 것이 아니면 단정하지 않겠다고 말한다.",
          resultText: "도해는 잠시 생각하더니 고개를 끄덕였다. 말의 방향이 조금 느려졌다.",
          effects: {
            stats: { sight: 3, courage: 1, care: 2, sincerity: 2 },
            relations: {
              yul: { closeness: 0, trust: 3, guard: -3 },
              dohae: { closeness: 2, trust: 4, guard: -1 },
              classmates: { closeness: -1, trust: 0, guard: 1 }
            },
            flags: ["refuse_rumor"]
          },
          nextEventId: "group_gate_001"
        },
        {
          id: "rumor_follow",
          text: "어색해지기 싫어 친구들의 말에 가볍게 맞장구친다.",
          resultText: "대화는 쉽게 흘러갔지만, 당신의 마음 한쪽에는 조금 걸리는 느낌이 남았다.",
          effects: {
            stats: { sight: -2, courage: 0, care: -2, sincerity: -1 },
            relations: {
              yul: { closeness: -1, trust: -2, guard: 6 },
              classmates: { closeness: 3, trust: 1, guard: -1 }
            },
            flags: ["followed_mood"]
          },
          nextEventId: "group_gate_001"
        },
        {
          id: "rumor_shift",
          text: "더 말이 커지기 전에 활동 이야기로 조심스럽게 화제를 바꾼다.",
          resultText: "누군가의 이야기가 더 커지기 전에 대화는 다음 활동으로 넘어갔다.",
          effects: {
            stats: { sight: 1, courage: 1, care: 3, sincerity: 0 },
            relations: {
              yul: { closeness: 0, trust: 2, guard: -2 },
              dohae: { closeness: 1, trust: 2, guard: 0 }
            },
            flags: ["protect_distance"]
          },
          nextEventId: "group_gate_001"
        }
      ]
    },
    {
      id: "group_gate_001",
      type: "hidden_event",
      title: "조별 활동 직전",
      phase: "중반",
      image: "assets/group-work.svg",
      text: "다음 활동은 짧은 감상문을 나누고 서로 질문을 붙이는 조별 과제다. 안율이 있는 조의 한 자리가 비어 있지만, 그 자리에 앉으려면 조심스러운 태도가 필요해 보인다.",
      speaker: "",
      dialogue: "어떤 거리를 선택할지에 따라 다음 장면이 달라진다.",
      required: { stats: {}, relations: {}, flags: [] },
      choices: [
        {
          id: "group_join_yul",
          text: "안율이 있는 조에서 빈 역할을 맡아 본다.",
          resultText: "당신은 조용히 빈 자리에 앉아, 먼저 할 일을 확인했다.",
          required: {
            stats: { sight: 18, care: 15 },
            relations: { yul: { guardMax: 65 } },
            flags: ["dont_judge_yul_quickly"]
          },
          effects: {
            stats: { sight: 1, courage: 2, care: 1, sincerity: 0 },
            relations: { yul: { closeness: 2, trust: 2, guard: -2 } },
            flags: []
          },
          nextEventId: "group_work_001"
        },
        {
          id: "group_keep_distance",
          text: "무리하게 다가가지 않고 지금은 내 조의 활동에 집중한다.",
          resultText: "당신은 오늘의 거리를 인정하고, 다음 기회를 남겨 두었다.",
          effects: {
            stats: { sight: 1, courage: 0, care: 2, sincerity: 0 },
            relations: { yul: { closeness: 0, trust: 1, guard: -1 } },
            flags: ["respected_distance"]
          },
          nextEventId: "distance_001"
        }
      ]
    },
    {
      id: "group_work_001",
      type: "hidden_event",
      title: "같은 책상 위의 활동지",
      phase: "중반",
      image: "assets/group-work.svg",
      text: "같은 조가 되자 책상 위에 각자의 문장이 놓인다. 안율은 자신의 문장을 지우개로 한 번 문지른 뒤, 다시 조용히 내려놓는다.",
      speaker: "안율",
      dialogue: "이 부분은... 그냥 넘어가도 돼.",
      required: {
        stats: { sight: 18, care: 15 },
        relations: { yul: { guardMax: 65 } },
        flags: ["dont_judge_yul_quickly"]
      },
      fallbackEventId: "distance_001",
      choices: [
        {
          id: "group_gentle",
          text: "활동지를 먼저 넘기며 말하지 않아도 되는 부분을 존중한다.",
          resultText: "안율의 손끝이 조금 느슨해졌다. 말하지 않아도 된다는 말이 오히려 대화를 열었다.",
          effects: {
            stats: { sight: 2, courage: 0, care: 5, sincerity: 3 },
            relations: { yul: { closeness: 8, trust: 10, guard: -12 } },
            flags: ["gentle_groupwork"]
          },
          nextEventId: "dialogue_001"
        },
        {
          id: "group_hurry",
          text: "시간이 부족하니 빠르게 정리하자고 말한다.",
          resultText: "활동은 진행됐지만, 안율의 대답은 더 짧아졌다.",
          effects: {
            stats: { sight: -1, courage: 2, care: -2, sincerity: 0 },
            relations: {
              yul: { closeness: -1, trust: -2, guard: 6 },
              dohae: { closeness: 0, trust: 2, guard: 0 }
            },
            flags: ["hurried_groupwork"]
          },
          nextEventId: "dialogue_001"
        }
      ]
    },
    {
      id: "distance_001",
      type: "dialogue",
      title: "아직은 멀리서 보이는 자리",
      phase: "중반",
      image: "assets/window.svg",
      text: "창가의 빛이 책상 끝에 걸린다. 안율과 같은 조가 되지는 않았지만, 당신은 오늘 들은 말들을 그대로 믿어도 되는지 다시 생각한다.",
      speaker: "나",
      dialogue: "가까이 가지 못해도, 바라보는 방식은 선택할 수 있다.",
      required: { stats: {}, relations: {}, flags: [] },
      choices: [
        {
          id: "distance_note",
          text: "오늘 관찰한 것을 감상 노트에 차분히 적어 둔다.",
          resultText: "당신은 누군가를 한 문장으로 정리하지 않기로 했다.",
          effects: {
            stats: { sight: 4, courage: 0, care: 3, sincerity: 1 },
            relations: { yul: { closeness: 0, trust: 2, guard: -3 } },
            flags: ["dont_judge_yul_quickly", "respected_distance"]
          },
          nextEventId: "ending_check_001"
        },
        {
          id: "distance_repeat",
          text: "친구들에게 들은 말을 그대로 감상에 섞어 말한다.",
          resultText: "말은 빨리 지나갔지만, 그 말이 누군가의 하루에 남을 수도 있다는 생각이 뒤늦게 따라왔다.",
          effects: {
            stats: { sight: -2, courage: 1, care: -2, sincerity: -1 },
            relations: { yul: { closeness: -2, trust: -3, guard: 10 } },
            flags: ["quick_judgment"]
          },
          nextEventId: "ending_check_001"
        }
      ]
    },
    {
      id: "dialogue_001",
      type: "dialogue",
      title: "하굣길 앞의 짧은 말",
      phase: "후반",
      image: "assets/after-school.svg",
      text: "활동이 끝나고 의자를 밀어 넣는 소리가 이어진다. 안율은 가방 끈을 고쳐 잡고 문 쪽으로 천천히 향한다. 지금 건넬 수 있는 말은 길지 않다.",
      speaker: "안율",
      dialogue: "오늘은... 좀 시끄러웠지.",
      required: { stats: {}, relations: {}, flags: [] },
      choices: [
        {
          id: "dialogue_gentle_words",
          text: "괜찮다면 네 속도로 말해도 된다고 말한다.",
          resultText: "안율은 작게 숨을 고르고, 처음보다 조금 편한 얼굴로 당신을 바라보았다.",
          effects: {
            stats: { sight: 2, courage: 1, care: 5, sincerity: 5 },
            relations: { yul: { closeness: 7, trust: 8, guard: -10 } },
            flags: ["gentle_words"]
          },
          nextEventId: "branch_001"
        },
        {
          id: "dialogue_pressure",
          text: "왜 그렇게 말이 없는지 직접 묻는다.",
          resultText: "당신의 질문은 솔직했지만, 안율에게는 조금 빠르게 닿았다.",
          effects: {
            stats: { sight: -2, courage: 3, care: -3, sincerity: 1 },
            relations: { yul: { closeness: -2, trust: -3, guard: 12 } },
            flags: ["pressured_yul"]
          },
          nextEventId: "branch_001"
        },
        {
          id: "dialogue_distance",
          text: "오늘은 인사만 건네고 더 묻지 않는다.",
          resultText: "짧은 인사 뒤에 남은 침묵은 불편함보다 여백에 가까웠다.",
          effects: {
            stats: { sight: 1, courage: 0, care: 3, sincerity: 1 },
            relations: { yul: { closeness: 1, trust: 3, guard: -4 } },
            flags: ["respected_distance"]
          },
          nextEventId: "branch_001"
        }
      ]
    },
    {
      id: "branch_001",
      type: "hidden_event",
      title: "한 걸음 더, 혹은 여기까지",
      phase: "후반",
      image: "assets/window.svg",
      text: "교실 문이 닫히기 전, 아직 아주 짧은 시간이 남아 있다. 더 듣는 일이 가능할 수도 있고, 오늘은 여기서 멈추는 편이 나을 수도 있다.",
      speaker: "",
      dialogue: "당신의 선택은 오늘의 결말을 향해 이어진다.",
      required: { stats: {}, relations: {}, flags: [] },
      choices: [
        {
          id: "branch_extra",
          text: "안율이 말하려는 만큼만 조금 더 들어 본다.",
          resultText: "당신은 대답보다 기다림을 먼저 건넸다.",
          required: {
            relations: { yul: { trust: 35, guardMax: 45 } },
            flags: ["gentle_words"]
          },
          effects: {
            stats: { sight: 2, courage: 1, care: 2, sincerity: 2 },
            relations: { yul: { closeness: 3, trust: 4, guard: -4 } },
            flags: ["shared_quiet_moment"]
          },
          nextEventId: "extra_dialogue_001"
        },
        {
          id: "branch_stop",
          text: "오늘은 여기까지라고 생각하고 조용히 인사한다.",
          resultText: "당신은 관계가 빨리 가까워지지 않아도 괜찮다는 것을 배웠다.",
          effects: {
            stats: { sight: 1, courage: 0, care: 3, sincerity: 1 },
            relations: { yul: { closeness: 1, trust: 2, guard: -2 } },
            flags: ["respected_distance"]
          },
          nextEventId: "ending_check_001"
        },
        {
          id: "branch_explain",
          text: "친구들에게 안율의 마음을 내가 해석해서 말해 주겠다고 한다.",
          resultText: "도와주려는 마음은 있었지만, 누군가의 마음을 대신 말하는 일은 너무 빨랐다.",
          effects: {
            stats: { sight: -2, courage: 2, care: -3, sincerity: -1 },
            relations: { yul: { closeness: -2, trust: -4, guard: 10 } },
            flags: ["quick_judgment"]
          },
          nextEventId: "ending_check_001"
        }
      ]
    },
    {
      id: "extra_dialogue_001",
      type: "dialogue",
      title: "창가에 남은 작은 대화",
      phase: "후반",
      image: "assets/window.svg",
      text: "안율은 길게 설명하지 않았다. 대신 활동지 귀퉁이에 남긴 문장을 손끝으로 짚었다. 그 문장은 누군가를 향한 대답이라기보다, 스스로에게 건넨 작은 확인처럼 보인다.",
      speaker: "안율",
      dialogue: "다 설명할 수는 없지만... 오늘은 조금 덜 답답했어.",
      required: {
        relations: { yul: { trust: 35, guardMax: 45 } },
        flags: ["gentle_words"]
      },
      fallbackEventId: "ending_check_001",
      choices: [
        {
          id: "extra_thanks",
          text: "고맙다고 말하고 오늘의 대화를 조용히 닫는다.",
          resultText: "말보다 오래 남는 것은, 서두르지 않은 시선이었다.",
          effects: {
            stats: { sight: 3, courage: 1, care: 3, sincerity: 3 },
            relations: { yul: { closeness: 4, trust: 5, guard: -5 } },
            flags: ["shared_quiet_moment"]
          },
          nextEventId: "ending_check_001"
        }
      ]
    },
    {
      id: "ending_check_001",
      type: "ending_check",
      title: "오늘의 시선이 남긴 것",
      phase: "엔딩",
      image: "assets/ending.svg",
      text: "오늘의 선택들이 하나의 결말로 이어진다.",
      speaker: "",
      dialogue: "",
      required: { stats: {}, relations: {}, flags: [] },
      choices: []
    }
  ],
  endings: [
    {
      id: "ending_001",
      title: "천천히 다시 보기",
      type: "변화 시작",
      condition: {
        stats: { sight: 24, care: 24 },
        relations: { yul: { trust: 34, guardMax: 48 } },
        flags: ["dont_judge_yul_quickly"]
      },
      text: "당신은 안율을 하나의 소문이나 짧은 표정으로 정리하지 않았다. 오늘의 변화는 크지 않지만, 누군가를 다시 바라보는 방식은 분명 달라졌다.",
      image: "assets/ending.svg"
    },
    {
      id: "ending_003",
      title: "성급한 시선",
      type: "오해 지속",
      condition: {
        relations: { yul: { guard: 75 } },
        anyFlags: ["quick_judgment", "pressured_yul", "followed_mood"]
      },
      text: "당신은 빠르게 판단했고, 빠르게 말했으며, 그 속도 안에서 놓친 표정들이 있었다. 다음에 다시 이 교실에 들어온다면, 조금 더 늦게 말해도 괜찮을지 모른다.",
      image: "assets/cloudy-classroom.svg"
    },
    {
      id: "ending_002",
      title: "아직은 먼 거리",
      type: "거리 유지",
      default: true,
      condition: {},
      text: "모든 관계가 하루 만에 가까워지지는 않는다. 그래도 당신은 오늘의 거리와 침묵을 기억했고, 그것은 다음 장면을 위한 조용한 준비가 되었다.",
      image: "assets/hallway.svg"
    }
  ]
};
