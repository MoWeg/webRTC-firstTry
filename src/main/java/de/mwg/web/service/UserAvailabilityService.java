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

@Service
public class UserAvailabilityService {

	private Set<UserAvailabilityDTO> availableUsers;

	public void addUser(UserAvailabilityDTO user){
		if(user == null){
			return;
		}
		if(availableUsers == null){
			availableUsers = new HashSet<>();
		}
		if(availableUsers.contains(user)){
		  availableUsers.remove(user);
		}
		availableUsers.add(user);
	}

	public void removeUser(UserAvailabilityDTO user){
		if(user == null){
			return;
		}
		if(availableUsers == null){
			return;
		}
		availableUsers.remove(user);
	}

	public List<UserAvailabilityDTO> getAvailableUsers(){
		List<UserAvailabilityDTO> result = new ArrayList<>();
		if(availableUsers != null){
			for(UserAvailabilityDTO user : availableUsers){
				result.add(user);
			}
        }
		return result;
	}
}
