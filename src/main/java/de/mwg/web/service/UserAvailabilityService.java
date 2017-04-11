package de.mwg.web.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import de.mwg.web.service.dto.UserAvailabilityDTO;
import de.mwg.web.web.websocket.UserAvailabilityNotificationService;

@Service
public class UserAvailabilityService  implements ApplicationListener<SessionDisconnectEvent> {
	
	@Autowired
	private UserAvailabilityNotificationService userAvailabilityNotificationService;
	
	private Set<UserAvailabilityDTO> availableUsers;
	
	public void addUser(UserAvailabilityDTO user){
		if(user == null){
			return;
		}
		if(availableUsers == null){
			availableUsers = new HashSet<>();
		}
		availableUsers.add(user);
		userAvailabilityNotificationService.notifyAllSubscribed();
	}
	
	public void removeUser(UserAvailabilityDTO user){
		if(user == null){
			return;
		}
		if(availableUsers == null){
			return;
		}
		availableUsers.remove(user);
		userAvailabilityNotificationService.notifyAllSubscribed();
	}
	
	public List<UserAvailabilityDTO> getAvailableUsers(){
		List<UserAvailabilityDTO> result = new ArrayList<>();
		for(UserAvailabilityDTO user : availableUsers){
			result.add(user);
		}
		return result;
	}

	@Override
	public void onApplicationEvent(SessionDisconnectEvent arg0) {
		String userName = arg0.getUser().getName();
		UserAvailabilityDTO disconnected = new UserAvailabilityDTO();
		disconnected.setUserName(userName);
		removeUser(disconnected);
	}
}
