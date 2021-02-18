void 
300 Player::update(float dt_sec) 
301 { 

 
309   if (m_dying && m_dying_timer.check()) { 
	310     Sector::get().stop_looping_sounds(); 
	311     set_bonus(NO_BONUS, true); 
	312     m_dead = true; 
	313     return; 
	314   } 
315 
 
//316   if (!m_dying && !m_deactivated) 
//	317     handle_input(); 
318 
 
319   /* 
320   // handle_input() calls apply_friction() when Tux is not walking, so we'll have to do this ourselves 
321   if (deactivated) 
322   apply_friction(); 
323   */ 
324 
 
325   // extend/shrink tux collision rectangle so that we fall through/walk over 1 
326   // tile holes 
327   if (fabsf(m_physic.get_velocity_x()) > MAX_WALK_XM) { 
	328     m_col.set_width(RUNNING_TUX_WIDTH); 
	329   } else { 
	330     m_col.set_width(TUX_WIDTH); 
	331   } 
332 
 
333   // on downward slopes, adjust vertical velocity so tux walks smoothly down 
//334   if (on_ground() && !m_dying) { 
//	335     if (m_floor_normal.y != 0) { 
//		336       if ((m_floor_normal.x * m_physic.get_velocity_x()) >= 0) { 
//			337         m_physic.set_velocity_y(250); 
//			338       } 
//		339     } 
//	340   } 
//341 
 
342   // handle backflipping 
//343   if (m_backflipping && !m_dying) { 
//	344     //prevent player from changing direction when backflipping 
//	345     m_dir = (m_backflip_direction == 1) ? Direction::LEFT : Direction::RIGHT; 
//	346     if (m_backflip_timer.started()) m_physic.set_velocity_x(100.0f * static_cast<float>(m_backflip_direction)); 
//	347     //rotate sprite during flip 
//	348     m_sprite->set_angle(m_sprite->get_angle() + (m_dir==Direction::LEFT?1:-1) * dt_sec * (360.0f / 0.5f)); 
//	349     if (m_player_status.has_hat_sprite()) { 
//		350       m_powersprite->set_angle(m_sprite->get_angle()); 
//		351       if (m_player_status.bonus == EARTH_BONUS) 
//			352         m_lightsprite->set_angle(m_sprite->get_angle()); 
//		353     } 
//	354   } 
//355 
 
356   // set fall mode... 
//357   if (on_ground()) { 
//	358     m_fall_mode = ON_GROUND; 
//	359     m_last_ground_y = get_pos().y; 
//	360   } else { 
//	361     if (get_pos().y > m_last_ground_y) 
//		362       m_fall_mode = FALLING; 
//	363     else if (m_fall_mode == ON_GROUND) 
//		364       m_fall_mode = JUMPING; 
//	365   } 
366 
 
367   // check if we landed 
368   if (on_ground()) { 
	369     m_jumping = false; 
	//370     if (m_backflipping && (m_backflip_timer.get_timegone() > 0.15f)) { 
	//371       m_backflipping = false; 
	//372       m_backflip_direction = 0; 
	//373       m_physic.set_velocity_x(0); 
	//379 
 
	//380       // if controls are currently deactivated, we take care of standing up ourselves 
	//381       if (m_deactivated) 
	//	382         do_standup(); 
	//383     } 
384     if (m_player_status.bonus == AIR_BONUS) 
	385       m_ability_time = static_cast<float>(m_player_status.max_air_time) * GLIDE_TIME_PER_FLOWER; 
386 
 
387     if (m_second_growup_sound_timer.check()) 
	388     { 
		389       SoundManager::current()->play("sounds/grow.wav"); 
		390       m_second_growup_sound_timer.stop(); 
		391     } 
392   } 
393 
 
394   // calculate movement for this frame 
395   m_col.m_movement = m_physic.get_movement(dt_sec); 
396 
 
//397   if (m_grabbed_object != nullptr && !m_dying) { 
//	398     position_grabbed_object(); 
//	399   } 
//400 
 
//401   if (m_grabbed_object != nullptr && m_dying){ 
//	402     m_grabbed_object->ungrab(*this, m_dir); 
//	403     m_grabbed_object = nullptr; 
//	404   } 
405 
 
406   if (!m_ice_this_frame && on_ground()) //
	407     m_on_ice = false; //
408 
 
409   m_on_ground_flag = false; 
410   m_ice_this_frame = false; 
411 
 
412   // when invincible, spawn particles 
413   if (m_invincible_timer.started()) 
	414   { 
		415     if (graphicsRandom.rand(0, 2) == 0) { 
			416       float px = graphicsRandom.randf(m_col.m_bbox.get_left()+0, m_col.m_bbox.get_right()-0); 
			417       float py = graphicsRandom.randf(m_col.m_bbox.get_top()+0, m_col.m_bbox.get_bottom()-0); 
			418       Vector ppos = Vector(px, py); 
			419       Vector pspeed = Vector(0, 0); 
			420       Vector paccel = Vector(0, 0); 
			421       Sector::get().add<SpriteParticle>( 
			422         "images/objects/particles/sparkle.sprite", 
			423         // draw bright sparkle when there is lots of time left, 
			424         // dark sparkle when invincibility is about to end 
			425         (m_invincible_timer.get_timeleft() > TUX_INVINCIBLE_TIME_WARNING) ? 
			426         // make every other a longer sparkle to make trail a bit fuzzy 
			427         (size_t(g_game_time*20)%2) ? "small" : "medium" 
			428         : 
			429         "dark", ppos, ANCHOR_MIDDLE, pspeed, paccel, LAYER_OBJECTS + 1 + 5); 
			430     } 
		431   } 
432 
 
433   if (m_growing) { 
	434     if (m_sprite->animation_done()) m_growing = false; 
	435   } 
436 
 
437   // when climbing animate only while moving 
438   if (m_climbing){ 
	439     if ((m_physic.get_velocity_x()==0)&&(m_physic.get_velocity_y()==0)) 
		440       m_sprite->stop_animation(); 
	441     else 
	442       m_sprite->set_animation_loops(-1); 
	443   } 
444 
 
445 } 
