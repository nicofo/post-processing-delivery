#version 330

layout (location = 0) out vec3 g_volumetric;
//varyings and out color

// uniform int u_use_diffuse_map;
// uniform sampler2D u_diffuse_map;
// uniform vec3 u_diffuse;
// uniform vec3 u_specular;


//varyings and out color
in vec2 v_uv;
in vec3 v_normal;
in vec3 v_light_dir;
in vec3 v_cam_dir;
in vec3 v_vertex_world_pos;
out vec4 fragColor;


//texture uniforms
uniform sampler2D l_tex_depth;
uniform sampler2D u_tex_depth;

uniform mat4 u_vp;
uniform vec3 l_direction;
uniform int l_type;
uniform vec3 l_position;
uniform vec3 l_color;
uniform mat4 l_view_projection;
uniform float l_linear_att;
uniform float l_quadratic_att;


float drawVolum(vec4 fragment_light_space, float NdotL ) {
    float z = gl_FragCoord.z / gl_FragCoord.w;
    //homogenous coord
   
    vec4 position_camera_space = u_vp * vec4(v_vertex_world_pos, 1.0);
	vec3 projected_coords_camera = position_camera_space.xyz / position_camera_space.w;
    //normalize
    projected_coords_camera = projected_coords_camera * 0.5 + 0.5;
    vec2 camera_map_depth = texture(u_tex_depth, projected_coords_camera.xy).rg;
    float draw = z > camera_map_depth.r && camera_map_depth.g > 0.0? 0.0 : 1.0;

    vec3 projected_coords = fragment_light_space.xyz / fragment_light_space.w;
    //normalize
    projected_coords = projected_coords * 0.5 + 0.5;
    vec2 texel_size = 1.0 / textureSize(l_tex_depth, 0);

    if (clamp(projected_coords, 0.0, 1.0) == projected_coords) {
        //distances
        float current_depth = projected_coords.z;
        float bias = max(0.05 * (1.0 - NdotL), 0.005);
        float shadow_map_depth = 0.0;
        //float shadow_difference = current_depth - texture(u_shadow_map[light_index], projected_coords.xy).r;
        float light_map_depth = texture(l_tex_depth, projected_coords.xy  *texel_size).r;

        draw *= current_depth> light_map_depth ? 0.0 : 1.0;
    }
    

    return draw;
}

void main(){

	vec3 L = normalize(l_direction.xyz); // for directional light
	vec3 N = normalize(v_normal); //normal
	float attenuation = 1.0;
    
    if (l_type > 0) {
    
        vec3 point_to_light = l_position.xyz - v_vertex_world_pos;
        L = normalize(point_to_light);
	    //attenuation
	    float distance = length(point_to_light);
	    attenuation = 1.0 / (1.0 + l_linear_att * distance + l_quadratic_att * (distance * distance));
    }
    
	//Shadow
	float NdotL = max(0.0, dot(-N, L));
	vec4 position_light_space = l_view_projection * vec4(v_vertex_world_pos, 1.0);
	float draw = drawVolum(position_light_space, NdotL);
	float z = gl_FragCoord.z / gl_FragCoord.w;
    //homogenous coord	


	// ---
	g_volumetric = l_color * attenuation * draw;
    
}