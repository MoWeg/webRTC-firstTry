package de.mwg.web.web.websocket.dto;

public class GroupDto {
	private long id;
	private Boolean visibleForUser;
	
	public long getId() {
		return id;
	}
	public void setId(long id) {
		this.id = id;
	}
	public Boolean isVisibleForUser() {
		return visibleForUser;
	}
	public void setVisibleForUser(Boolean visibleForUser) {
		this.visibleForUser = visibleForUser;
	}
}
