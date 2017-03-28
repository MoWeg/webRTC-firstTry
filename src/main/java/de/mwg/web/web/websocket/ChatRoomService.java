package de.mwg.web.web.websocket;

import java.security.Principal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import de.mwg.web.web.websocket.dto.ActivityDTO;
import de.mwg.web.web.websocket.dto.SimpleChatMessageDTO;

@Controller
public class ChatRoomService implements ApplicationListener<SessionDisconnectEvent> {

	private static final Logger log = LoggerFactory.getLogger(ChatRoomService.class);
	
	private DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SimpMessageSendingOperations messagingTemplate;

    public ChatRoomService(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @SubscribeMapping("/topic/rooms/send")
    @SendTo("/topic/rooms/receive")
    public  ActivityDTO  sendSimpleMessage(@Payload  ActivityDTO activityDTO, StompHeaderAccessor stompHeaderAccessor, Principal principal) {
    	activityDTO.setUserLogin(principal.getName());
    	Instant instant = Instant.ofEpochMilli(Calendar.getInstance().getTimeInMillis());
    	activityDTO.setTime(dateTimeFormatter.format(ZonedDateTime.ofInstant(instant, ZoneOffset.systemDefault())));
    	log.debug("User entered rooms {}", activityDTO.getUserLogin());
    	return activityDTO;
    }
    
    @SubscribeMapping("/topic/rooms/send/{user}")
    @SendTo("/topic/rooms/receive/{user}")
    public SimpleChatMessageDTO sendSimpleMessageToUser(@Payload SimpleChatMessageDTO simpleChatMessageDTO, StompHeaderAccessor stompHeaderAccessor, Principal principal) {
    	simpleChatMessageDTO.setUserLogin(principal.getName());
    	Instant instant = Instant.ofEpochMilli(Calendar.getInstance().getTimeInMillis());
    	simpleChatMessageDTO.setTime(dateTimeFormatter.format(ZonedDateTime.ofInstant(instant, ZoneOffset.systemDefault())));
    	log.debug("Sending user a simple message {}", simpleChatMessageDTO);
    	return simpleChatMessageDTO;
    }
    
	@Override
	public void onApplicationEvent(SessionDisconnectEvent arg0) {
		// TODO Auto-generated method stub
		
	} 


}
