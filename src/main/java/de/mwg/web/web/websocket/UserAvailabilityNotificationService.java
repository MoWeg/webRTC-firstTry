package de.mwg.web.web.websocket;

import org.springframework.context.ApplicationListener;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import de.mwg.web.web.websocket.dto.UserAvailabilityNotificationDTO;

@Controller
public class UserAvailabilityNotificationService {

	@SendTo("topic/notification/user/availability")
	public UserAvailabilityNotificationDTO notifyAllSubscribed(){
		return new UserAvailabilityNotificationDTO();
	}

}
