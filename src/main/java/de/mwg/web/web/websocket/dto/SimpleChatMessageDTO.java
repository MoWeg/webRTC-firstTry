package de.mwg.web.web.websocket.dto;

import org.json.JSONObject;

public class SimpleChatMessageDTO {
	
	private String content;
	private String userLogin;
	private String time;
	private String goal;
	
	private String type;
	private String spd;
	private String label;
	private String id;
	private String candidate;

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
	
	public String getUserLogin() {
		return userLogin;
	}

	public void setUserLogin(String userLogin) {
		this.userLogin = userLogin;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}
	
	public String getGoal() {
		return goal;
	}

	public void setGoal(String goal) {
		this.goal = goal;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getSpd() {
		return spd;
	}

	public void setSpd(String spd) {
		this.spd = spd;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getCandidate() {
		return candidate;
	}

	public void setCandidate(String candidate) {
		this.candidate = candidate;
	}

	@Override
    public String toString() {
        return "Message{" +
            " userLogin='" + userLogin + '\'' +
            ", content='" + content + '\'' +
            ", time='" + time + '\'' +
            ", goal='" + goal + '\'' +
             ", type='" + type + '\'' +
            '}';
    }
}
