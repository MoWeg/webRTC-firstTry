package de.mwg.web.web.websocket.dto;

public class SimpleChatMessageDTO {
	
	private String content;
	private String userLogin;
	private String time;

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
	
	@Override
    public String toString() {
        return "Message{" +
            " userLogin='" + userLogin + '\'' +
            ", content='" + content + '\'' +
            ", time='" + time + '\'' +
            '}';
    }
}
