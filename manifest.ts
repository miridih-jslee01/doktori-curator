import { Manifest } from "deno-slack-sdk/mod.ts";
import { CreatePollFunction } from "./functions/create_poll.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "number-emoji-poll",
  description: "슬랙에서 숫자 이모지를 사용한 투표를 손쉽게 생성하는 앱",
  icon: "assets/default_new_app_icon.png",
  functions: [CreatePollFunction],
  workflows: [],
  outgoingDomains: [],
  botScopes: ["commands", "chat:write", "chat:write.public", "reactions:write"],
});
