package de.mwg.web.service.dto;

import java.util.Objects;

public class UserAvailabilityDTO {
	private String userName, chatId;
	private boolean isAvailable;

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}
	
	public String getChatId() {
		return chatId;
	}

	public void setChatId(String chatId) {
		this.chatId = chatId;
	}

	public boolean isAvailable() {
		return isAvailable;
	}

	public void setAvailable(boolean isAvailable) {
		this.isAvailable = isAvailable;
	}

	@Override
	public boolean equals(Object o){
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		UserAvailabilityDTO user = (UserAvailabilityDTO) o;
		if(user.userName == null || userName == null){
			return false;
		}
		return Objects.equals(userName, user.userName);
	}
	
	@Override
	public int hashCode(){
		return Objects.hashCode(userName);
	}
}
