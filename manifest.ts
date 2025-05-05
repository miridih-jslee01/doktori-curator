import { Manifest } from "deno-slack-sdk/mod.ts";
import { CreatePollFunction } from "./functions/create_poll/index.ts";
import { CheckPollResultFunction } from "./functions/check_poll_result/index.ts";
import { SelectPresenterFunction } from "./functions/select_presenter/index.ts";
import { EncouragePollFunction } from "./functions/encourage_poll/index.ts";

/**
 * 앱 매니페스트는 앱의 구성을 포함합니다.
 * 이 파일은 앱 이름과 설명과 같은 속성을 정의합니다.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "doktori-curator",
  displayName: "Doktori Curator",
  description: "독서동호회 독토리 운영을 위한 커스텀 스텝을 제공합니다.",
  icon: "assets/icon.png",
  functions: [
    CreatePollFunction,
    CheckPollResultFunction,
    SelectPresenterFunction,
    EncouragePollFunction,
  ],
  workflows: [],
  outgoingDomains: [],
  botScopes: [
    "commands",
    "channels:read",
    "groups:read",
    "im:read",
    "mpim:read",
    "chat:write",
    "chat:write.public",
    "reactions:write",
    "reactions:read",
    "users:read",
  ],
});
